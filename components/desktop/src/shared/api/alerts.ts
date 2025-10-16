import { Notify } from 'quasar';
import { extractGraphQLErrorMessages } from './errors';

export function SuccessAlert(
  message: string,
  action?: {
    text?: string;
    icon?: string;
    handler: () => void;
  }
): void {
  const actions = action ? [{
    ...(action.text ? { label: action.text } : { icon: action.icon || 'launch' }),
    color: 'white',
    size: 'sm',
    flat: true,
    handler: action.handler,
  }] : [{
    icon: 'close',
    color: 'white',
    round: true,
    size: 'sm',
    flat: true,
    handler: () => {
      /* ... */
    },
  }];

  Notify.create({
    message,
    color: 'primary',
    position: 'top-right',
    actions,
  });
}

export function FailAlert(error: any, text?: string): void {
  let message = extractGraphQLErrorMessages(error);
  message = message.replace('assertion failure with message: ', '');

  Notify.create({
    message: text ? text+': '+message : message,
    type: 'negative',
    position: 'top-right',
    actions: [
      {
        icon: 'close',
        color: 'white',
        round: true,
        size: 'sm',
        flat: true,
        handler: () => {
          /* ... */
        },
      },
    ],
  });
}

export function NotifyAlert(
  title: string,
  body?: string,
  avatar?: string,
): void {
  Notify.create({
    message: title,
    caption: body,
    avatar: avatar,
    position: 'top-right',
    timeout: 8000,
    actions: [
      {
        icon: 'close',
        round: true,
        size: 'sm',
        flat: true,
        handler: () => {
          /* ... */
        },
      },
    ],
  });
}
