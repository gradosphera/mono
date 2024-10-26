export const notificationTemplate = {
  subject: `{{#if (eq data.from receiver)}} Исходящий перевод на {{data.quantity}} от {{data.from}} на {{data.to}} {{else}} Входящий перевод на {{data.quantity}} от {{data.from}} на {{data.to}} {{/if}}`,
  message: `{{#if (eq data.from receiver)}} Отправлен перевод на сумму {{data.quantity}} с аккаунта {{data.from}} на аккаунт {{data.to}} {{else}} Получен перевод на сумму {{data.quantity}} от {{data.from}} на аккаунт {{data.to}} {{/if}}`,
}
