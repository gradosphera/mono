import index from './index.vue'

export default {
  'menu': [{
    'pageName': 'Совет',
    'name': 'soviet',
    'icon': 'fa-regular fa-circle',
    'isMobile': true,
    'protected': true,
    'params': {
      coopname: ''
    }
  }],
  'routes': [
    {
      path: ':coopname/soviet',
      name: 'soviet',
      component: index,  
    }
  ]
}
