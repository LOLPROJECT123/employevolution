
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isMobileApp } from '@/utils/mobileUtils';

interface DeepLinkHandlerProps {
  children: React.ReactNode;
}

export const DeepLinkHandler: React.FC<DeepLinkHandlerProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Handle deep links for mobile app
    if (isMobileApp()) {
      handleMobileDeepLinks();
    }

    // Handle web deep links with state
    handleWebDeepLinks();
  }, [location]);

  const handleMobileDeepLinks = () => {
    // Listen for app URL schemes
    document.addEventListener('resume', () => {
      // Check if app was opened via deep link
      const urlParams = new URLSearchParams(window.location.search);
      const deepLink = urlParams.get('deeplink');
      
      if (deepLink) {
        processDeepLink(deepLink);
      }
    });
  };

  const handleWebDeepLinks = () => {
    const urlParams = new URLSearchParams(location.search);
    
    // Handle OAuth callbacks
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleOAuthCallback(code, state);
      return;
    }

    // Handle shared links
    const shared = urlParams.get('shared');
    if (shared) {
      handleSharedContent(shared);
      return;
    }

    // Handle job application links
    const jobId = urlParams.get('jobId');
    const action = urlParams.get('action');
    if (jobId && action) {
      handleJobAction(jobId, action);
      return;
    }
  };

  const processDeepLink = (deepLink: string) => {
    try {
      const url = new URL(deepLink);
      const path = url.pathname;
      const params = new URLSearchParams(url.search);

      // Navigate to the appropriate route
      const targetPath = mapDeepLinkToRoute(path, params);
      if (targetPath) {
        navigate(targetPath);
      }
    } catch (error) {
      console.error('Invalid deep link:', error);
    }
  };

  const mapDeepLinkToRoute = (path: string, params: URLSearchParams): string | null => {
    const pathMap: Record<string, string> = {
      '/jobs': '/jobs',
      '/profile': '/profile',
      '/applications': '/applications',
      '/calendar': '/calendar',
      '/resume': '/resume-tools',
      '/interview': '/interview-practice',
      '/networking': '/networking',
      '/analytics': '/analytics'
    };

    const basePath = pathMap[path];
    if (!basePath) return null;

    // Add query parameters
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  const handleOAuthCallback = (code: string, state: string) => {
    // Determine the OAuth provider from state
    const stateData = JSON.parse(atob(state));
    const provider = stateData.provider;

    switch (provider) {
      case 'linkedin':
        navigate(`/auth/linkedin/callback?code=${code}&state=${state}`);
        break;
      case 'google':
        navigate(`/auth/google/callback?code=${code}&state=${state}`);
        break;
      case 'outlook':
        navigate(`/auth/outlook/callback?code=${code}&state=${state}`);
        break;
      default:
        console.warn('Unknown OAuth provider:', provider);
    }
  };

  const handleSharedContent = (sharedId: string) => {
    // Handle shared resume, job posting, etc.
    navigate(`/shared/${sharedId}`);
  };

  const handleJobAction = (jobId: string, action: string) => {
    switch (action) {
      case 'apply':
        navigate(`/jobs/${jobId}/apply`);
        break;
      case 'save':
        navigate(`/jobs/${jobId}?action=save`);
        break;
      case 'view':
        navigate(`/jobs/${jobId}`);
        break;
      default:
        navigate(`/jobs/${jobId}`);
    }
  };

  return <>{children}</>;
};

export default DeepLinkHandler;
