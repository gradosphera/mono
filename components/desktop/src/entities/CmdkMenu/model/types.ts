export interface PageItem {
  name: string;
  meta: any;
  shortcut?: string;
}

export interface GroupedItem {
  workspaceName: string;
  title: string;
  icon: string;
  isActive: boolean;
  pages: PageItem[];
}

export interface CmdkMenuState {
  showDialog: boolean;
  searchQuery: string;
  selectedIndex: number;
  selectedPageIndex: number;
  searchInput: HTMLInputElement | undefined;
}
