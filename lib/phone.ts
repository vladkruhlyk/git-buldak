/**
 * Перевірка українського номера. Приймає те, як люди реально пишуть:
 * +380 63 111 22 33, 380631112233, 0631112233, 80631112233, 631112233.
 *
 * Повертає нормалізований номер або null, якщо номер не схожий на справжній.
 * Використовується і у формі, і на сервері — клієнту довіряти не можна.
 */
export function normalizeUaPhone(raw: string): string | null {
  const digits = (raw || '').replace(/\D/g, '');

  let local: string;
  if (digits.length === 12 && digits.startsWith('380')) local = digits.slice(3);
  else if (digits.length === 11 && digits.startsWith('80')) local = digits.slice(2);
  else if (digits.length === 10 && digits.startsWith('0')) local = digits.slice(1);
  else if (digits.length === 9) local = digits;
  else return null;

  // Код оператора чи міста не починається з нуля.
  if (local.startsWith('0')) return null;
  // Відсіюємо заглушки на кшталт 111111111 чи 000000000.
  if (/^(\d)\1{8}$/.test(local)) return null;

  return `+380 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
}
