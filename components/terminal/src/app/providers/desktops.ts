import { defineStore } from 'pinia'
import * as Desktops from 'src/desktops'
import { computed, ComputedRef, ref, Ref } from 'vue'
import { FailAlert } from 'src/shared/api'
import { RouteRecordRaw, type RouteLocationNormalized} from 'vue-router'


interface IDesktop {
  name: string
  hash: string
  authorizedHome: string
  nonAuthorizedHome: string
  routes: IRoute[]
  config: object
}

interface IBlockchainDesktops {
  defaultHash: string //hash
  availableHashes: string[] //hashes
}

interface RouteMeta {
  title: string;
  icon: string;
  roles: string[];
}

export interface IRoute {
  path: string;
  name: string;
  component?: any;
  children?: IRoute[];
  meta: RouteMeta;
}


const desktopHashMap = {
  'hash1': Desktops.UserDesktopModel.manifest, //User
  'hash2': Desktops.ChairmanDesktopModel.manifest, //'Chairman',
  'hash3': Desktops.MemberDesktopModel.manifest, //'Member',
  'hash4': Desktops.SetupDesktopModel.manifest, //Setup
}

const namespace = 'desktops';


interface IDesktopStore {
  currentDesktop: Ref<IDesktop | undefined>
  availableDesktops: Ref<IDesktop[]>
  defaultDesktopHash: Ref<string | undefined>
  setActiveDesktop: (hash: string | undefined) => void;
  loadDesktops: () => void;
  getSecondLevel: (currentRoute: RouteLocationNormalized) => RouteRecordRaw[]
  firstLevel: ComputedRef<IRoute[]>;

  // secondLevel: ComputedRef<IRoute[]>;
}


function getNestedRoutes(route: RouteRecordRaw):RouteRecordRaw[]  {
  if (!route.children) {
    return [];
  }

  let nestedRoutes: RouteRecordRaw[] = [];

  for (const child of route.children) {
    nestedRoutes.push(child);
    nestedRoutes = nestedRoutes.concat(getNestedRoutes(child));
  }

  return nestedRoutes;
}

export const useDesktopStore = defineStore(namespace, (): IDesktopStore => {
  const currentDesktop = ref<IDesktop>()
  const availableDesktops = ref<IDesktop[]>([])
  const defaultDesktopHash = ref<string>()

  const firstLevel = computed(() => {
    if (currentDesktop.value)
      return currentDesktop.value.routes
    else return []
  });


  const getSecondLevel = (currentRoute: RouteLocationNormalized): RouteRecordRaw[] => {
    if (currentRoute.matched && currentDesktop.value && currentRoute) {

      const matchingRootRoute = currentRoute.matched[1]

      if (matchingRootRoute) {
        return getNestedRoutes(matchingRootRoute)
      }
    }
    return [];
  }


  const setActiveDesktop = (hash: string | undefined) => {
    const desktop = availableDesktops.value.find(d => d.hash === hash)
    if (desktop)
      currentDesktop.value = desktop
    else {
      FailAlert('Рабочий стол не найден')
    }
  }

  const loadAvailableDesktops = async(): Promise<IBlockchainDesktops> => {
    return { //load it from bc later
      defaultHash: 'hash1',
      availableHashes: ['hash1','hash2', 'hash3']
    }
  }


  const loadDesktops = async () => {
    const {defaultHash, availableHashes} = await loadAvailableDesktops()
    availableDesktops.value = []
    defaultDesktopHash.value = defaultHash

    availableHashes.map(hash => availableDesktops.value.push(
      desktopHashMap[hash as keyof typeof desktopHashMap]
    ))
  }

  return {
    defaultDesktopHash, //перезапишем через локал-сторадж для пользовательского управления стартовой страницей
    currentDesktop,
    availableDesktops,
    setActiveDesktop,
    loadDesktops,
    getSecondLevel,
    firstLevel,
  }
})
