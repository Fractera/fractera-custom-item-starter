// КОМУ ВИДНА ПОЛОСА БЫСТРОЙ НАВИГАЦИИ (шаг 706-3). Владелец 2026-11-09, дословно: «Считаю правильным оставить этот баннер всегда если
// страница имеет формат Local хост, или если это собственный домен то оставить этот баннер если его видит архитектор».
//
// Чистая функция без импортов: признаки адреса вычисляет вызывающий теми же функциями, что читает замок слоя (`lib/auth/*`,
// `lib/showcase`), а здесь только правило — его проверяет `npm run test:quick-nav` на любом имени хоста без браузера.
//   эта машина      — всегда (здесь работает владелец);
//   временный адрес — никогда: ссылку видит любой, войти там нельзя, архитектора там не бывает;
//   витрина Fractera — никогда: это показ продукта гостям;
//   свой домен      — только вошедшему архитектору; роли ещё не известны (`null`) — не показывать.
export type QuickNavPlace = { loopback: boolean; temporary: boolean; showcase: boolean }

export function quickNavVisible(place: QuickNavPlace, roles: string[] | null): boolean {
  if (place.loopback) return true
  if (place.temporary || place.showcase) return false
  return Array.isArray(roles) && roles.includes('architect')
}
