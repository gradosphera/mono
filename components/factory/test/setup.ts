import { generator, mongoUri, preLoading } from './utils'

export default async () => {
  console.log('Global setup running...')

  await generator.connect(mongoUri)
  await preLoading()
  await generator.disconnect()
  console.log('Global setup done.')
}
