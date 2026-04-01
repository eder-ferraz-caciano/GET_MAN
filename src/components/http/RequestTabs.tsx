import type { AuthConfig } from '../../types';

interface RequestTabsProps {
  activeReq: any;
  activeReqTab: string;
  setActiveReqTab: (tab: string) => void;
  handleActiveReqChange: (updates: any) => void;
  renderAuthFields: (auth: AuthConfig, onChange: (updates: Partial<AuthConfig>) => void) => React.ReactNode;
  renderVarTable: (vars: any[], onChange: (v: any[]) => void, title: string, showEnabled?: boolean) => React.ReactNode;
  pickBinaryFile: () => void;
  pickFormDataFile: (fieldId: string) => void;
  addLog: (type: string, message: string) => void;
}

export function RequestTabs(_props: RequestTabsProps) {
  return <></>;
}
