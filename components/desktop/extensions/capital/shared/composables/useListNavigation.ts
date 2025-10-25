import { useRouter } from 'vue-router';

export function useListNavigation() {
  const router = useRouter();

  const navigateToProject = (projectHash: string) => {
    router.push({
      name: 'project-description',
      params: { project_hash: projectHash }
    });
  };

  const navigateToComponent = (componentHash: string) => {
    router.push({
      name: 'component-description',
      params: { project_hash: componentHash }
    });
  };

  return {
    navigateToProject,
    navigateToComponent
  };
}
