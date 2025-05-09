import type { Zeus } from '@coopenomics/sdk/index';

// Добавляю реэкспорты типов документов
export type IChainDocument2 = Zeus.ModelTypes['SignedBlockchainDocument']
export type ISignedDocument = Zeus.ModelTypes['SignedDigitalDocumentInput']
export type ISignatureInfo = Zeus.ModelTypes['SignatureInfo']
export type IMetaDocument<T = any> = Zeus.ModelTypes['MetaDocumentInput'] & T
export type IComplexDocument = Zeus.ModelTypes['DocumentPackageAggregate']
export type IDocument<T = any> = Omit<Zeus.ModelTypes['SignedDigitalDocumentInput'], 'meta'> & {
  meta: IMetaDocument<T>
}
// Для обратной совместимости
export type IObjectedDocument = IDocument;
