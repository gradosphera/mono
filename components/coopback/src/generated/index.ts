import { GraphQLClient } from 'graphql-request';
import { getSdk } from './graphql'; // Импортируем SDK из сгенерированного файла

const client = new GraphQLClient('http://localhost:4000/graphql');
const sdk = getSdk(client);

async function fetchExtensions() {
  try {
    const {
      data: { getExtensions },
    } = await sdk.GetExtensions();
    console.log('Extensions:', getExtensions);
  } catch (error) {
    console.error('Error fetching extensions:', error);
  }
}

async function installExtension() {
  try {
    const { data: installExtension } = await sdk.InstallExtension({
      appData: {
        name: 'NewExtension',
        enabled: true,
        config: { setting1: 'value1' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
    console.log('Installed Extension:', installExtension);
  } catch (error) {
    console.error('Error installing extension:', error);
  }
}

// Вызов функций
fetchExtensions();
installExtension();
