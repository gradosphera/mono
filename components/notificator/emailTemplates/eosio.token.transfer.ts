export const notificationTemplate = {
  subject: `{{#if (eq data.from receiver)}} Исходящий перевод на {{data.quantity}} {{else}} Входящий перевод на {{data.quantity}} {{/if}}`,
  message: `{{#if (eq data.from receiver)}} Отправлен перевод на сумму {{data.quantity}} аккаунту {{data.to}} {{else}} Получен перевод на сумму {{data.quantity}} от {{data.from}} {{/if}}`,
}
