import type { SavedResponse, LogEntry } from '../../types';

interface ResponseViewerProps {
  activeResponse: SavedResponse | null;
  activeResTab: string;
  setActiveResTab: (tab: string) => void;
  activeLogs: LogEntry[];
  setActiveLogs: (logs: LogEntry[]) => void;
  copiedRes: boolean;
  copyResponse: () => void;
  downloadResponse: () => void;
  setActiveResponse: (response: SavedResponse | null) => void;
}

export function ResponseViewer(_props: ResponseViewerProps) {
  return <></>;
}
