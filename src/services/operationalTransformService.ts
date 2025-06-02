
export interface Operation {
  type: 'insert' | 'delete' | 'retain';
  length?: number;
  text?: string;
  position: number;
  userId: string;
  timestamp: number;
}

export interface DocumentState {
  content: string;
  version: number;
  operations: Operation[];
  cursors: Map<string, CursorPosition>;
}

export interface CursorPosition {
  userId: string;
  position: number;
  selection?: { start: number; end: number };
  userInfo: {
    name: string;
    color: string;
  };
}

export class OperationalTransformService {
  private static transformInsertInsert(op1: Operation, op2: Operation): Operation[] {
    if (op1.position <= op2.position) {
      return [op1, { ...op2, position: op2.position + (op1.text?.length || 0) }];
    } else {
      return [{ ...op1, position: op1.position + (op2.text?.length || 0) }, op2];
    }
  }

  private static transformInsertDelete(op1: Operation, op2: Operation): Operation[] {
    if (op1.position <= op2.position) {
      return [op1, { ...op2, position: op2.position + (op1.text?.length || 0) }];
    } else if (op1.position >= op2.position + (op2.length || 0)) {
      return [{ ...op1, position: op1.position - (op2.length || 0) }, op2];
    } else {
      // Insert is within delete range - complex case
      const adjustedDelete = { ...op2, length: (op2.length || 0) + (op1.text?.length || 0) };
      return [op1, adjustedDelete];
    }
  }

  private static transformDeleteDelete(op1: Operation, op2: Operation): Operation[] {
    const op1End = op1.position + (op1.length || 0);
    const op2End = op2.position + (op2.length || 0);

    if (op1End <= op2.position) {
      return [op1, { ...op2, position: op2.position - (op1.length || 0) }];
    } else if (op2End <= op1.position) {
      return [{ ...op1, position: op1.position - (op2.length || 0) }, op2];
    } else {
      // Overlapping deletes - merge them
      const newStart = Math.min(op1.position, op2.position);
      const newEnd = Math.max(op1End, op2End);
      const mergedDelete: Operation = {
        type: 'delete',
        position: newStart,
        length: newEnd - newStart,
        userId: op1.userId,
        timestamp: Math.max(op1.timestamp, op2.timestamp)
      };
      return [mergedDelete];
    }
  }

  static transform(op1: Operation, op2: Operation): Operation[] {
    if (op1.type === 'insert' && op2.type === 'insert') {
      return this.transformInsertInsert(op1, op2);
    } else if (op1.type === 'insert' && op2.type === 'delete') {
      return this.transformInsertDelete(op1, op2);
    } else if (op1.type === 'delete' && op2.type === 'insert') {
      const [transformedOp2, transformedOp1] = this.transformInsertDelete(op2, op1);
      return [transformedOp1, transformedOp2];
    } else if (op1.type === 'delete' && op2.type === 'delete') {
      return this.transformDeleteDelete(op1, op2);
    }
    return [op1, op2];
  }

  static applyOperation(content: string, operation: Operation): string {
    switch (operation.type) {
      case 'insert':
        return content.slice(0, operation.position) + 
               (operation.text || '') + 
               content.slice(operation.position);
      case 'delete':
        return content.slice(0, operation.position) + 
               content.slice(operation.position + (operation.length || 0));
      case 'retain':
        return content;
      default:
        return content;
    }
  }

  static transformCursor(cursor: CursorPosition, operation: Operation): CursorPosition {
    let newPosition = cursor.position;

    if (operation.type === 'insert') {
      if (operation.position <= cursor.position) {
        newPosition += operation.text?.length || 0;
      }
    } else if (operation.type === 'delete') {
      if (operation.position <= cursor.position) {
        newPosition = Math.max(operation.position, cursor.position - (operation.length || 0));
      }
    }

    return {
      ...cursor,
      position: newPosition
    };
  }
}
