export interface ConflictData {
  id: string;
  field: string;
  localValue: any;
  remoteValue: any;
  timestamp: Date;
  userId: string;
  conflictType: 'concurrent_edit' | 'version_mismatch' | 'data_inconsistency';
}

export interface ResolutionStrategy {
  type: 'merge' | 'override_local' | 'override_remote' | 'manual';
  rules?: any;
}

export class ConflictResolutionService {
  static detectConflicts(localData: any, remoteData: any, lastSync: Date): ConflictData[] {
    const conflicts: ConflictData[] = [];

    Object.keys(localData).forEach(key => {
      const localValue = localData[key];
      const remoteValue = remoteData[key];

      if (this.hasConflict(localValue, remoteValue, lastSync)) {
        conflicts.push({
          id: `conflict_${Date.now()}_${key}`,
          field: key,
          localValue,
          remoteValue,
          timestamp: new Date(),
          userId: '', // Will be set by calling service
          conflictType: this.determineConflictType(localValue, remoteValue)
        });
      }
    });

    return conflicts;
  }

  private static hasConflict(localValue: any, remoteValue: any, lastSync: Date): boolean {
    if (!localValue || !remoteValue) return false;
    
    // Check if both values have been modified since last sync
    const localModified = localValue.updated_at && new Date(localValue.updated_at) > lastSync;
    const remoteModified = remoteValue.updated_at && new Date(remoteValue.updated_at) > lastSync;
    
    return localModified && remoteModified && JSON.stringify(localValue) !== JSON.stringify(remoteValue);
  }

  private static determineConflictType(localValue: any, remoteValue: any): ConflictData['conflictType'] {
    if (localValue.version && remoteValue.version && localValue.version !== remoteValue.version) {
      return 'version_mismatch';
    }
    
    if (Math.abs(new Date(localValue.updated_at).getTime() - new Date(remoteValue.updated_at).getTime()) < 5000) {
      return 'concurrent_edit';
    }
    
    return 'data_inconsistency';
  }

  static async resolveConflict(conflict: ConflictData, strategy: ResolutionStrategy): Promise<any> {
    switch (strategy.type) {
      case 'merge':
        return this.mergeValues(conflict.localValue, conflict.remoteValue);
      
      case 'override_local':
        return conflict.localValue;
      
      case 'override_remote':
        return conflict.remoteValue;
      
      case 'manual':
        // Return conflict for manual resolution
        return null;
      
      default:
        throw new Error(`Unknown resolution strategy: ${strategy.type}`);
    }
  }

  private static mergeValues(localValue: any, remoteValue: any): any {
    if (typeof localValue === 'string' && typeof remoteValue === 'string') {
      return this.mergeStrings(localValue, remoteValue);
    }
    
    if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
      return this.mergeArrays(localValue, remoteValue);
    }
    
    if (typeof localValue === 'object' && typeof remoteValue === 'object') {
      return this.mergeObjects(localValue, remoteValue);
    }
    
    // For primitive types, use remote value with newer timestamp
    return new Date(remoteValue.updated_at) > new Date(localValue.updated_at) 
      ? remoteValue 
      : localValue;
  }

  private static mergeStrings(local: string, remote: string): string {
    // Simple three-way merge for strings
    const commonPrefix = this.getCommonPrefix(local, remote);
    const commonSuffix = this.getCommonSuffix(local, remote);
    
    const localMiddle = local.slice(commonPrefix.length, local.length - commonSuffix.length);
    const remoteMiddle = remote.slice(commonPrefix.length, remote.length - commonSuffix.length);
    
    return commonPrefix + localMiddle + ' ' + remoteMiddle + commonSuffix;
  }

  private static mergeArrays(local: any[], remote: any[]): any[] {
    const merged = [...local];
    
    remote.forEach(item => {
      if (!merged.some(existing => JSON.stringify(existing) === JSON.stringify(item))) {
        merged.push(item);
      }
    });
    
    return merged;
  }

  private static mergeObjects(local: any, remote: any): any {
    const merged = { ...local };
    
    Object.keys(remote).forEach(key => {
      if (!(key in merged)) {
        merged[key] = remote[key];
      } else if (typeof merged[key] === 'object' && typeof remote[key] === 'object') {
        merged[key] = this.mergeObjects(merged[key], remote[key]);
      }
      // Keep local value for conflicting primitive properties
    });
    
    return merged;
  }

  private static getCommonPrefix(str1: string, str2: string): string {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return str1.slice(0, i);
  }

  private static getCommonSuffix(str1: string, str2: string): string {
    let i = 0;
    while (i < str1.length && i < str2.length && 
           str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
      i++;
    }
    return str1.slice(str1.length - i);
  }
}
