/**
 * Строит множество из значений массива для быстрой проверки наличия.
 * Проверка `has` в Set работает за O(1), в отличие от `includes` в массиве.
 *
 * @param {Array} values Значения, которые нужно запомнить.
 * @returns {Set} Множество значений.
 */
function buildLookup(values) {
  const lookup = new Set();

  for (const value of values) {
    lookup.add(value);
  }

  return lookup;
}

/**
 * Возвращает элементы первого массива, которых нет во втором.
 * Порядок элементов первого массива сохраняется, повторы в нём тоже.
 * Исходные массивы не изменяются: результат собирается в новом массиве.
 *
 * @param {Array} arr1 Массив, из которого выбираются элементы.
 * @param {Array} arr2 Массив значений, которые нужно исключить.
 * @returns {Array} Новый массив с разницей.
 */
export function difference(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    throw new TypeError('Оба аргумента должны быть массивами');
  }

  const excluded = buildLookup(arr2);
  const result = [];

  for (const item of arr1) {
    if (!excluded.has(item)) {
      result.push(item);
    }
  }

  return result;
}
