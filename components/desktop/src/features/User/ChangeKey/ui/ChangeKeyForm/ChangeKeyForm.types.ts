export interface ChangeKeyFormProps {
  /** Внешне форсируемое состояние загрузки (например, во время on-chain action) */
  loading?: boolean;
}

export interface ChangeKeySubmitPayload {
  currentWif: string;
  newWif: string;
}
