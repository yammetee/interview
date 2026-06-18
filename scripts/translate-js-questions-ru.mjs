import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data", "cards");
const write = process.argv.includes("--write");

const exact = new Map(
  Object.entries({
    "What is a promise": "Что такое Promise?",
    "Why do you need a promise": "Зачем нужен Promise?",
    "What are the main rules of promise": "Какие основные правила работы с Promise?",
    "What is promise chaining": "Что такое цепочка Promise?",
    "What is promise.all": "Что такое Promise.all()?",
    "What are the pros and cons of promises over callbacks": "Какие плюсы и минусы у Promise по сравнению с callback-функциями?",
    "What is nodejs": "Что такое Node.js?",
    "What is the event loop": "Что такое event loop?",
    "What is the event queue": "Что такое очередь событий?",
    "What are dynamic imports": "Что такое динамические импорты?",
    "What are the different ways to deal with Asynchronous Code": "Какими способами можно работать с асинхронным кодом?",
    "What are tasks in event loop": "Что такое задачи в event loop?",
    "What is microtask": "Что такое microtask?",
    "What is the purpose of queueMicrotask": "Для чего нужен queueMicrotask()?",
    "What are the differences between promises and observables": "В чем разница между Promise и Observable?",
    "What is an event table": "Что такое таблица событий?",
    "What is a microTask queue": "Что такое очередь microtask?",
    "What are the common use cases of observables": "Где обычно используются Observable?",
    "What is RxJS": "Что такое RxJS?",
    "What is an observable": "Что такое Observable?",
    "What is an async function": "Что такое async-функция?",
    "What is the easiest way to ignore promise errors?": "Как проще всего игнорировать ошибки Promise?",
    "How to use await outside of async function prior to ES2022?": "Как использовать await вне async-функции до ES2022?",

    "What is a service worker": "Что такое Service Worker?",
    "How do you manipulate DOM using a service worker": "Как работать с DOM через Service Worker?",
    "How do you reuse information across service worker restarts": "Как переиспользовать данные между перезапусками Service Worker?",
    "What is a post message": "Что такое postMessage?",
    "What is a Cookie": "Что такое cookie?",
    "What are the differences between cookie, local storage and session storage": "В чем разница между cookie, localStorage и sessionStorage?",
    "What is the main difference between localStorage and sessionStorage": "В чем основная разница между localStorage и sessionStorage?",
    "What is a storage event and its event handler": "Что такое событие storage и его обработчик?",
    "How do you check web workers browser support": "Как проверить, поддерживает ли браузер Web Workers?",
    "Give an example of a web worker": "Приведите пример Web Worker.",
    "What are the restrictions of web workers on DOM": "Какие ограничения есть у Web Workers при работе с DOM?",
    "What are server-sent events": "Что такое Server-Sent Events?",
    "How do you receive server-sent event notifications": "Как получать уведомления через Server-Sent Events?",
    "How do you check browser support for server-sent events": "Как проверить поддержку Server-Sent Events в браузере?",
    "What are the events available for server sent events": "Какие события доступны в Server-Sent Events?",
    "What is the difference between window and document": "В чем разница между window и document?",
    "What is an event flow": "Что такое поток событий?",
    "What is event capturing": "Что такое capturing-фаза события?",
    "What is event bubbling": "Что такое всплытие события?",
    "What is same-origin policy": "Что такое Same-Origin Policy?",
    "What is the use of preventDefault method": "Для чего нужен метод preventDefault()?",
    "What are the steps involved in return false usage": "Что происходит при использовании return false?",
    "What is BOM": "Что такое BOM?",
    "What is an event delegation": "Что такое делегирование событий?",
    "What are PWAs": "Что такое PWA?",
    "How do you determine two values same or not using object": "Как проверить равенство двух значений с помощью Object?",
    "How do you encode an URL": "Как закодировать URL?",
    "How do you decode an URL": "Как декодировать URL?",
    "How to get the value from get parameters": "Как получить значение из GET-параметров?",
    "What are asynchronous thunks": "Что такое асинхронные thunk-функции?",
    "What is AJAX": "Что такое AJAX?",
    "What is web speech API": "Что такое Web Speech API?",
    "What is Babel": "Что такое Babel?",
    "What is babel": "Что такое Babel?",
    "What are different event loops": "Какие бывают event loop?",
    "What is the difference between shim and polyfill": "В чем разница между shim и polyfill?",
    "Why is it important to remove event listeners after use?": "Почему важно удалять event listeners после использования?",

    "What is the purpose of the array slice method": "Для чего нужен метод массива slice()?",
    "What is the purpose of the array splice method": "Для чего нужен метод массива splice()?",
    "What is the difference between slice and splice": "В чем разница между slice() и splice()?",
    "What is the purpose of the let keyword": "Для чего нужно ключевое слово let?",
    "What is the difference between let and var": "В чем разница между let и var?",
    "What is the reason to choose the name let as a keyword": "Почему для ключевого слова выбрали название let?",
    "How do you redeclare variables in a switch block without an error": "Как переобъявлять переменные внутри switch без ошибки?",
    "What is the Temporal Dead Zone": "Что такое Temporal Dead Zone (TDZ)?",
    "What is Hoisting": "Что такое hoisting?",
    "Explain the three states of promise": "Объясните три состояния Promise.",
    "What is the purpose of the race method in promise": "Для чего нужен метод Promise.race()?",
    "What is the purpose of double exclamation": "Для чего используют двойное отрицание (!!)?",
    "What is the purpose of the delete operator": "Для чего нужен оператор delete?",
    "What is the difference between null and undefined": "В чем разница между null и undefined?",
    "What is the difference between undeclared and undefined variables": "В чем разница между undeclared и undefined переменными?",
    "What is the purpose of setTimeout": "Для чего нужен setTimeout()?",
    "What is the purpose of setInterval": "Для чего нужен setInterval()?",
    "What is a callback function": "Что такое callback-функция?",
    "What is a callback hell": "Что такое callback hell?",
    "What is JSON and its common operations": "Что такое JSON и какие операции с ним используются чаще всего?",
    "What is TypeScript": "Что такое TypeScript?",
    "What is typescript": "Что такое TypeScript?",
    "What are the differences between javascript and typescript": "В чем разница между JavaScript и TypeScript?",
    "What are the advantages of typescript over javascript": "Какие преимущества есть у TypeScript перед JavaScript?",
    "What is the MEAN stack": "Что такое MEAN stack?",
    "What are raw strings": "Что такое raw strings?",
    "Is PostMessage secure": "Безопасен ли postMessage?",
    "Is postMessages synchronous": "postMessage работает синхронно?",
    "What paradigm is Javascript": "К какой парадигме относится JavaScript?",
    "What is the purpose of double tilde operator": "Для чего используют оператор двойной тильды (~~)?",
    "What is minimum timeout throttling": "Что такое minimum timeout throttling?",
    "How do you prevent promises swallowing errors": "Как не допустить, чтобы Promise скрывал ошибки?",
    "What is a Proper Tail Call": "Что такое proper tail call?",
    "What are the differences between arguments object and rest parameter": "В чем разница между объектом arguments и rest-параметром?",
    "What are the differences between spread operator and rest parameter": "В чем разница между spread-оператором и rest-параметром?",
    "What is nullish coalescing operator (??)?": "Что такое оператор nullish coalescing (??)?",
    "What is optional chaining?": "Что такое optional chaining?",
    "What is debouncing?": "Что такое debouncing?",
    "What is throttling?": "Что такое throttling?",
    "What is the purpose of the this keyword in JavaScript?": "Для чего нужно ключевое слово this в JavaScript?",
    "What are the optimization techniques of V8 engine?": "Какие техники оптимизации использует движок V8?",
    "How do you create polyfills for map, filter and reduce methods?": "Как создать polyfill для методов map(), filter() и reduce()?",
    "What is the difference between map and forEach functions?": "В чем разница между map() и forEach()?",
    "What are the array mutation methods?": "Какие методы мутируют массив?",

    "What is a prototype chain": "Что такое цепочка прототипов?",
    "What is the difference between proto and prototype": "В чем разница между __proto__ и prototype?",
    "How do you extend classes": "Как расширять классы?",
    "Does javascript uses mixins": "Использует ли JavaScript миксины?",
    "How do you define instance and non-instance properties": "Как определить свойства экземпляра и статические свойства?",

    "What are break and continue statements": "Что такое break и continue?",
    "What is the purpose of switch-case": "Для чего нужен switch-case?",
    "What are the conventions to be followed for the usage of switch case": "Каких правил стоит придерживаться при использовании switch-case?",
    "What are the real world use cases of proxy?": "Какие реальные сценарии использования есть у Proxy?",

    "What are the options in a cookie": "Какие параметры есть у cookie?",
    "How do you delete a cookie": "Как удалить cookie?",
    "How do you access web storage": "Как получить доступ к Web Storage?",
    "How do you check web storage browser support": "Как проверить поддержку Web Storage в браузере?",
    "How do you access history in javascript": "Как получить доступ к history в JavaScript?",
    "How do you submit a form using JavaScript": "Как отправить форму с помощью JavaScript?",
    "What is the difference between document load and DOMContentLoaded events": "В чем разница между событиями document load и DOMContentLoaded?",
    "What is the difference between an attribute and a property": "В чем разница между атрибутом и свойством?",
    "Is JavaScript a compiled or interpreted language": "JavaScript — компилируемый или интерпретируемый язык?",
    "How do you get the current url with javascript": "Как получить текущий URL с помощью JavaScript?",
    "How do you change the style of a HTML element": "Как изменить стиль HTML-элемента?",
    "How do you detect a mobile browser": "Как определить мобильный браузер?",
    "How do you detect a mobile browser without regexp": "Как определить мобильный браузер без регулярных выражений?",
    "What are the ways to execute javascript after a page load": "Какими способами можно выполнить JavaScript после загрузки страницы?",
    "How do you detect a browser language preference": "Как определить языковые предпочтения браузера?",
    "How do you get the metadata of a module": "Как получить метаданные модуля?",
    "How do I modify the url without reloading the page": "Как изменить URL без перезагрузки страницы?",
    "How do you avoid receiving postMessages from attackers": "Как избежать получения postMessage от злоумышленников?",
    "How do you get the status of a checkbox": "Как получить состояние checkbox?",
    "How do you capture browser back button": "Как перехватить кнопку Back в браузере?",
    "What are the possible side-effects in javascript?": "Какие побочные эффекты возможны в JavaScript?",
    "What are the event phases of a browser?": "Какие фазы событий есть в браузере?",
    "How to detect system dark mode in javascript?": "Как определить системную темную тему в JavaScript?",

    "What are the possible ways to create objects in JavaScript": "Какие способы создания объектов есть в JavaScript?",
    "What are the benefits of pure functions": "В чем преимущества чистых функций?",
    "What are the methods available on session storage": "Какие методы доступны в sessionStorage?",
    "How do you detect caps lock key turned on or not": "Как определить, включен ли Caps Lock?",
    "Is JavaScript a case-sensitive language": "JavaScript чувствителен к регистру?",
    "How do you parse JSON string": "Как распарсить JSON-строку?",
    "How do you check whether a string contains a substring": "Как проверить, содержит ли строка подстроку?",
    "How do you validate an email in javascript": "Как проверить email в JavaScript?",
    "How do you get query string values in javascript": "Как получить значения query string в JavaScript?",
    "How do you check if a key exists in an object": "Как проверить, существует ли ключ в объекте?",
    "How do you loop through or enumerate javascript object": "Как пройтись по свойствам JavaScript-объекта?",
    "How do you test for an empty object": "Как проверить объект на пустоту?",
    "How do you make first letter of the string in an uppercase": "Как перевести первую букву строки в верхний регистр?",
    "How do you display the current date in javascript": "Как вывести текущую дату в JavaScript?",
    "How do you compare two date objects": "Как сравнить два объекта Date?",
    "How do you check if a string starts with another string": "Как проверить, начинается ли строка с другой строки?",
    "How do you add a key value pair in javascript": "Как добавить пару ключ-значение в JavaScript?",
    "What is the way to find the number of parameters expected by a function": "Как узнать количество параметров, ожидаемых функцией?",
    "What are the benefits of keeping declarations at the top": "В чем преимущества объявления переменных в начале области видимости?",
    "What are the recommendations to create new object": "Какие рекомендации есть при создании нового объекта?",
    "What is a RegExp object": "Что такое объект RegExp?",
    "How do you search a string for a pattern": "Как искать шаблон в строке?",
    "What is the purpose of breakpoints in debugging": "Для чего нужны breakpoints при отладке?",
    "Can I use reserved words as identifiers": "Можно ли использовать зарезервированные слова как идентификаторы?",
    "How do you convert date to another timezone in javascript": "Как преобразовать дату в другой часовой пояс в JavaScript?",
    "What are the properties used to get size of window": "Какие свойства используются для получения размера окна?",
    "What is a conditional operator in javascript": "Что такое условный оператор в JavaScript?",
    "Can you give an example of when you really need a semicolon": "Можете привести пример, когда semicolon действительно нужен?",
    "Why do I need to use the freeze method": "Зачем нужен метод Object.freeze()?",
    "How to convert a string to title case with javascript": "Как преобразовать строку в title case с помощью JavaScript?",
    "What are various operators supported by javascript": "Какие операторы поддерживает JavaScript?",
    "How do you determine whether object is frozen or not": "Как определить, заморожен ли объект?",
    "How do you copy properties from one object to other": "Как скопировать свойства из одного объекта в другой?",
    "What is the purpose of the seal method": "Для чего нужен метод Object.seal()?",
    "How do you determine if an object is sealed or not": "Как определить, запечатан ли объект?",
    "How do you get enumerable key and value pairs": "Как получить перечисляемые пары ключ-значение?",
    "What is the main difference between Object.values and Object.entries method": "В чем основная разница между Object.values() и Object.entries()?",
    "How can you get the list of keys of any object": "Как получить список ключей любого объекта?",
    "List down the collection of methods available on WeakSet": "Перечислите методы, доступные в WeakSet.",
    "List down the collection of methods available on WeakMap": "Перечислите методы, доступные в WeakMap.",
    "How do you print the contents of web page": "Как распечатать содержимое веб-страницы?",
    "What is the precedence order between local and global variables": "Какой приоритет у локальных переменных относительно глобальных?",
    "What are javascript accessors": "Что такое accessors в JavaScript?",
    "How do you perform language specific date and time formatting": "Как выполнить локализованное форматирование даты и времени?",
    "How does synchronous iteration works": "Как работает синхронная итерация?",
    "How do you sort elements in an array": "Как отсортировать элементы массива?",
    "How do you reverse an array": "Как развернуть массив?",
    "How do you find the min and max values in an array": "Как найти минимальное и максимальное значения в массиве?",
    "How do you find the min and max values without Math functions": "Как найти минимальное и максимальное значения без методов Math?",
    "How do you check whether an object can be extended or not": "Как проверить, можно ли расширять объект?",
    "How do you prevent an object from being extend": "Как запретить расширение объекта?",
    "What are the different ways to make an object non-extensible": "Какими способами можно сделать объект нерасширяемым?",
    "How do you define multiple properties on an object": "Как определить несколько свойств на объекте?",
    "What are the common tools used for minification": "Какие инструменты обычно используют для минификации?",
    "How do you perform form validation using javascript": "Как выполнить валидацию формы с помощью JavaScript?",
    "What are the DOM methods available for constraint validation": "Какие DOM-методы доступны для constraint validation?",
    "What are the available constraint validation DOM properties": "Какие DOM-свойства доступны для constraint validation?",
    "Are enums available in javascript": "Есть ли enum в JavaScript?",
    "How do you list all properties of an object": "Как вывести все свойства объекта?",
    "How do you get property descriptors of an object": "Как получить дескрипторы свойств объекта?",
    "How do you check whether or not an array includes a particular value": "Как проверить, содержит ли массив конкретное значение?",
    "How do you compare scalar arrays": "Как сравнить массивы скалярных значений?",
    "What is the difference between java and javascript": "В чем разница между Java и JavaScript?",
    "How do you declare a namespace": "Как объявить namespace?",
    "How do you get the timezone offset of a date object": "Как получить смещение часового пояса у объекта Date?",
    "How do you load CSS and JS files dynamically": "Как динамически загрузить CSS и JS-файлы?",
    "Why do we call javascript as dynamic language": "Почему JavaScript называют динамическим языком?",
    "How do you create an infinite loop": "Как создать бесконечный цикл?",
    "Why do you need to avoid with statement": "Почему стоит избегать оператора with?",
    "What is the output of the following for loops": "Какой будет результат следующих циклов for?",
    "List down some of the features of ES6": "Перечислите некоторые возможности ES6.",
    "Does the `const` variable make the value immutable": "Делает ли `const` значение неизменяемым?",
    "Can I avoid using postMessages completely": "Можно ли полностью отказаться от postMessage?",
    "How do you convert character to ASCII code": "Как преобразовать символ в ASCII-код?",
    "What are the list of cases error thrown from non-strict mode to strict mode": "В каких случаях код без strict mode начнет выбрасывать ошибки после включения strict mode?",
    "What is the difference between a parameter and an argument": "В чем разница между параметром и аргументом?",
    "How do you create specific number of copies of a string": "Как создать заданное количество копий строки?",
    "How do you return all matching strings against a regular expression": "Как вернуть все строки, совпадающие с регулярным выражением?",
    "How do you trim a string at the beginning or ending": "Как обрезать строку в начале или в конце?",
    "How do you map the array values without using map method": "Как преобразовать значения массива без метода map()?",
    "How do you empty an array": "Как очистить массив?",
    "What is the easiest way to convert an array to an object": "Как проще всего преобразовать массив в объект?",
    "How do you create an array with some data": "Как создать массив с данными?",
    "What are the placeholders from console object": "Какие placeholders доступны в console?",
    "Is it possible to debug HTML elements in console": "Можно ли отлаживать HTML-элементы в console?",
    "How do you display data in a tabular format using console object": "Как вывести данные в табличном виде через console?",
    "How to cancel a fetch request": "Как отменить fetch-запрос?",
    "How do you use javascript libraries in typescript file": "Как использовать JavaScript-библиотеки в TypeScript-файле?",
    "How do you detect primitive or non primitive value type": "Как определить, является значение примитивным или непримитивным?",
    "What is the easiest way to resize an array": "Как проще всего изменить размер массива?",
    "How do you make an object iterable in javascript": "Как сделать объект iterable в JavaScript?",
    "How do you check an object is a promise or not": "Как проверить, является ли объект Promise?",
    "How to invoke an IIFE without any extra brackets?": "Как вызвать IIFE без лишних скобок?",
    "Is that possible to use expressions in switch cases?": "Можно ли использовать выражения в case-блоках switch?",
    "How do style the console output using CSS?": "Как стилизовать вывод в console с помощью CSS?",
    "What are the different ways to create sparse arrays?": "Какими способами можно создать sparse array?",
    "How do you reverse an array without modifying original array?": "Как развернуть массив, не изменяя исходный?",
    "How to verify if a variable is an array?": "Как проверить, является ли переменная массивом?",
    "What is pass by value and pass by reference?": "Что такое передача по значению и передача по ссылке?",
    "What is module pattern?": "Что такое module pattern?",
    "What are the uses of closures?": "Для чего используются замыкания?",
    "What are the possible reasons for memory leaks?": "Какие возможные причины утечек памяти?",
    "What are the different ways to execute external scripts?": "Какими способами можно выполнить внешние скрипты?",
    "What is globalThis, and what is the importance of it?": "Что такое globalThis и зачем он нужен?",
    "What is module scope in JavaScript?": "Что такое module scope в JavaScript?",
    "What is structuredClone and how is it used for deep copying objects?": "Что такое structuredClone и как он используется для глубокого копирования объектов?",

    "What is the Difference Between `call`, `apply`, and `bind`": "В чем разница между `call`, `apply` и `bind`?",
    "How do you compare Object and Map": "Как сравнить Object и Map?",
    "How do you decode or encode a URL in JavaScript?": "Как декодировать или кодировать URL в JavaScript?",
    "Why do we need callbacks": "Зачем нужны callback-функции?",
    "What is a strict mode in javascript": "Что такое strict mode в JavaScript?",
    "Is there any relation between Java and JavaScript": "Есть ли связь между Java и JavaScript?",
    "Who created javascript": "Кто создал JavaScript?",
    "What is the use of stopPropagation method": "Для чего нужен метод stopPropagation()?",
    "What is the use of setTimeout": "Для чего нужен setTimeout()?",
    "What is the use of setInterval": "Для чего нужен setInterval()?",
    "Why is JavaScript treated as Single threaded": "Почему JavaScript считают однопоточным?",
    "How do you redirect new page in javascript": "Как перенаправить пользователя на новую страницу в JavaScript?",
    "How do you trim a string in javascript": "Как обрезать строку в JavaScript?",
    "Is the !-- notation represents a special operator": "Является ли запись !-- специальным оператором?",
    "Can we define properties for functions": "Можно ли определять свойства у функций?",
    "Can you write a random integers function to print integers within a range": "Можно ли написать функцию, которая выводит случайные целые числа в заданном диапазоне?",
    "What is the need of tree shaking": "Зачем нужен tree shaking?",
    "Is it recommended to use eval": "Рекомендуется ли использовать eval?",
    "What are the string methods that accept Regular expression": "Какие строковые методы принимают регулярное выражение?",
    "What would be the result of 1+2+'3'": "Каким будет результат выражения 1 + 2 + '3'?",
    "How do you get the image width and height using JS": "Как получить ширину и высоту изображения с помощью JS?",
    "What is the purpose of the freeze method": "Для чего нужен метод Object.freeze()?",
    "How do you detect if javascript is disabled on the page": "Как определить, отключен ли JavaScript на странице?",
    "What happens if you do not use rest parameter as a last argument": "Что произойдет, если rest-параметр не будет последним аргументом?",
    "What are the bitwise operators available in javascript": "Какие битовые операторы доступны в JavaScript?",
    "What is the purpose of using object is method": "Для чего нужен метод Object.is()?",
    "What are the applications of the assign method": "Где применяется метод Object.assign()?",
    "What are the applications of the seal method": "Где применяется метод Object.seal()?",
    "How do you create an object with a prototype": "Как создать объект с заданным prototype?",
    "Can I add getters and setters using defineProperty method": "Можно ли добавить геттеры и сеттеры через defineProperty()?",
    "What are the different ways to access object properties": "Какими способами можно обращаться к свойствам объекта?",
    "When do you get a syntax error": "Когда возникает SyntaxError?",
    "What are the different error names from error object": "Какие имена ошибок доступны у объекта Error?",
    "What are the two types of loops in javascript": "Какие два типа циклов есть в JavaScript?",
    "What are the properties of the Intl object": "Какие свойства есть у объекта Intl?",
    "What is the advantage of the comma operator": "В чем преимущество оператора запятая?",
    "What happens if you write constructor more than once in a class": "Что произойдет, если объявить constructor в классе больше одного раза?",
    "How do you perform form validation without javascript": "Как выполнить валидацию формы без JavaScript?",
    "What are the attributes provided by a property descriptor": "Какие атрибуты предоставляет дескриптор свойства?",
    "Does JavaScript support namespaces": "Поддерживает ли JavaScript namespace?",
    "How do you invoke javascript code in an iframe from the parent page": "Как вызвать JavaScript-код внутри iframe с родительской страницы?",
    "How to set the cursor to wait": "Как установить курсор в состояние wait?",
    "What is the difference between internal and external javascript": "В чем разница между внутренним и внешним JavaScript?",
    "Is JavaScript faster than server side script": "JavaScript быстрее серверного скрипта?",
    "What is the output of below string expression": "Какой будет результат строкового выражения ниже?",
    "How to remove all line breaks from a string": "Как удалить все переносы строк из строки?",
    "What happens with negating an array": "Что происходит при отрицании массива?",
    "How do you create self string using special characters": "Как создать строку `'self'` с помощью специальных символов?",
    "How do you remove falsy values from an array": "Как удалить falsy-значения из массива?",
    "How do you get unique values of an array": "Как получить уникальные значения массива?",
    "Is it possible to add CSS to console messages": "Можно ли добавить CSS к сообщениям в console?",
    "How do you verify that an argument is a Number or not": "Как проверить, является ли аргумент числом?",
    "How do you create copy to clipboard button": "Как создать кнопку копирования в буфер обмена?",
    "What is the shortcut to get timestamp": "Какой быстрый способ получить timestamp?",
    "How do you disable right click in the web page": "Как отключить правый клик на веб-странице?",
    "How to detect if a function is called as constructor": "Как определить, вызвана ли функция как конструктор?",
    "How do you create custom HTML element?": "Как создать пользовательский HTML-элемент?",
    "How do you create your own bind method using either call or apply method?": "Как создать собственный bind() с помощью call() или apply()?",
    "What are the differences between pure and impure functions?": "В чем разница между чистыми и нечистыми функциями?",
    "How to find the number of parameters expected by a function?": "Как узнать количество параметров, ожидаемых функцией?",

    "What is the difference between get and defineProperty": "В чем разница между get и defineProperty()?",
    "How do you call the constructor of a parent class": "Как вызвать constructor родительского класса?",
    "How do you get the prototype of an object": "Как получить prototype объекта?",
    "What happens If I pass string type for getPrototype method": "Что произойдет, если передать строку в метод getPrototype()?",
    "How do you set the prototype of one object to another": "Как установить prototype одного объекта в другой объект?",
    "Do all objects have prototypes": "У всех ли объектов есть prototype?",
    "Mixin Example using Object composition": "Пример mixin через композицию объектов.",
    "Benefits": "Преимущества.",

    "What are the tools or techniques used for debugging JavaScript code": "Какие инструменты и техники используют для отладки JavaScript-кода?",
    "What are the pros and cons of for loops": "Какие плюсы и минусы у циклов for?",

    "How do you find operating system details": "Как получить сведения об операционной системе?",
    "How do you generate random integers": "Как сгенерировать случайные целые числа?",
    "How do you make synchronous HTTP request": "Как выполнить синхронный HTTP-запрос?",
    "How do you make asynchronous HTTP request": "Как выполнить асинхронный HTTP-запрос?",
    "What are the use cases for dynamic imports": "Где используются динамические импорты?",
    "How do you implement zero timeout in modern browsers": "Как реализовать zero timeout в современных браузерах?",

    "How do you assign default values to variables": "Как присвоить переменным значения по умолчанию?",
    "How do you define multiline strings": "Как определить многострочные строки?",
    "What are the benefits of initializing variables": "В чем преимущества инициализации переменных?",
    "How do you define property on Object constructor": "Как определить свойство на constructor объекта?",
    "Can I redeclare let and const variables": "Можно ли повторно объявлять переменные let и const?",
    "How do you swap variables in destructuring assignment": "Как поменять переменные местами через destructuring assignment?",
    "How do you combine two or more arrays": "Как объединить два или больше массивов?",
    "How do you round numbers to certain decimals": "Как округлить число до заданного количества знаков после запятой?",

    "Why do you need modules": "Зачем нужны модули?",
    "Why do you need a Cookie": "Зачем нужны cookie?",
    "Why do you need web storage": "Зачем нужен Web Storage?",
    "How do you declare strict mode": "Как объявить strict mode?",
    "How do you define JSON arrays": "Как определить JSON-массивы?",
    "Can you apply chaining on conditional operator": "Можно ли делать цепочки из условных операторов?",
    "What are the advantages of Getters and Setters": "В чем преимущества геттеров и сеттеров?",
    "What are the advantages of minification": "В чем преимущества минификации?",
    "How do you print numbers with commas as thousand separators": "Как вывести числа с запятыми в качестве разделителей тысяч?",
    "How do you write multi-line strings in template literals": "Как записывать многострочные строки в template literals?",
    "How do you flattening multi dimensional arrays": "Как сгладить многомерные массивы?",
    "How do you group and nest console output?": "Как группировать и вкладывать вывод в console?",
    "What are the phases of execution context?": "Какие фазы есть у контекста выполнения?",
    "What are the benefits higher order functions?": "В чем преимущества функций высшего порядка?",

    "Is the !-- notation represents a special operator": "Является ли запись !-- специальным оператором?",
    "What is the difference between == and === operators": "В чем разница между операторами == и ===?",
    "What are the advantages of module loaders": "В чем преимущества загрузчиков модулей?",

    "What is the difference between native, host and user objects": "В чем разница между native, host и user objects?",
    "What is the purpose of void 0": "Для чего используется void 0?",
    "What are the different methods to find HTML elements in DOM": "Какими методами можно найти HTML-элементы в DOM?",

    "What is an IIFE (Immediately Invoked Function Expression)": "Что такое IIFE (Immediately Invoked Function Expression)?",
    "What is typeof operator": "Что такое оператор typeof?",
    "What are the differences between undeclared and undefined variables": "В чем разница между undeclared и undefined переменными?",
    "What are global variables": "Что такое глобальные переменные?",
    "What are the problems with global variables": "Какие проблемы возникают из-за глобальных переменных?",
    "What are events": "Что такое события?",
    "What is the purpose JSON stringify": "Для чего нужен JSON.stringify()?",
    "What are the various url properties of location object": "Какие URL-свойства есть у объекта location?",
    "What are js labels": "Что такое labels в JavaScript?",
    "What is a Regular Expression": "Что такое регулярное выражение?",
    "What are modifiers in regular expression": "Что такое модификаторы регулярных выражений?",
    "What is the purpose of exec method": "Для чего нужен метод exec()?",
    "What is the freeze method": "Что такое метод Object.freeze()?",
    "What is the purpose of uneval": "Для чего нужен uneval()?",
    "What is the difference between uneval and eval": "В чем разница между uneval() и eval()?",
    "What is an anonymous function": "Что такое анонимная функция?",
    "What are the various statements in error handling": "Какие конструкции используются для обработки ошибок?",
    "What is a decorator": "Что такое decorator?",
    "What is an Unary operator": "Что такое унарный оператор?",
    "What is the purpose of compareFunction while sorting arrays": "Для чего нужен compareFunction при сортировке массивов?",
    "What is an empty statement and purpose of it": "Что такое пустой statement и зачем он нужен?",
    "What is an object initializer": "Что такое object initializer?",
    "What are default parameters": "Что такое параметры по умолчанию?",
    "What are nesting templates": "Что такое вложенные templates?",
    "What are tagged templates": "Что такое tagged templates?",
    "What are default values in destructuring assignment": "Что такое значения по умолчанию в destructuring assignment?",
    "What are enhanced object literals": "Что такое enhanced object literals?",
    "What are typed arrays": "Что такое typed arrays?",
    "What is collation": "Что такое collation?",
    "What is for...of statement": "Что такое statement for...of?",
    "What is the purpose of some method in arrays": "Для чего нужен метод some() у массивов?",
    "What is the output of below console statement with unary operator": "Какой будет результат console-выражения ниже с унарным оператором?",
    "What is a thunk function": "Что такое thunk-функция?",
    "What is the output of prepend additive operator on falsy values": "Какой будет результат применения унарного плюса к falsy-значениям?",
    "What is destructuring aliases": "Что такое aliases в destructuring?",
    "What is the purpose of dir method of console object": "Для чего нужен метод console.dir()?",
    "What are wrapper objects": "Что такое wrapper objects?",
    "Is Node.js completely single threaded": "Node.js полностью однопоточный?",
    "What is the difference between Function constructor and function declaration": "В чем разница между Function constructor и function declaration?",
    "What is a Short circuit condition": "Что такое short-circuit condition?",
    "What is the difference between function and class declarations": "В чем разница между function declaration и class declaration?",
    "What is deno": "Что такое Deno?",
    "What are the different kinds of generators": "Какие виды generators существуют?",
    "What are the built-in iterables": "Что такое встроенные iterables?",
    "What are the differences between for...of and for...in statements": "В чем разница между statements for...of и for...in?",
    "What is the difference between dense and sparse arrays?": "В чем разница между dense array и sparse array?",
    "What is an environment record?": "Что такое environment record?",
    "What is Function Composition?": "Что такое function composition?",
    "Give an example of statements affected by automatic semicolon insertion?": "Приведите пример statements, на которые влияет automatic semicolon insertion.",
    "What are hidden classes?": "Что такое hidden classes?",
    "What is Lexical Scope?": "Что такое lexical scope?",
    "What is the difference between substring and substr methods?": "В чем разница между методами substring() и substr()?",
    "What are shadowing and illegal shadowing?": "Что такое shadowing и illegal shadowing?",
    "What is the difference between const and Object.freeze": "В чем разница между const и Object.freeze()?",

    "What is the purpose of isFinite function": "Для чего нужна функция isFinite()?",
    "What is the purpose of clearTimeout method": "Для чего нужен метод clearTimeout()?",
    "What is the purpose of clearInterval method": "Для чего нужен метод clearInterval()?",
    "What is an arguments object": "Что такое объект arguments?",
    "What is an app shell model": "Что такое app shell model?",
    "What are regular expression patterns": "Что такое patterns в регулярных выражениях?",
    "What is a debugger statement": "Что такое statement debugger?",
    "What are the differences between the freeze and seal methods": "В чем разница между методами Object.freeze() и Object.seal()?",
    "What are primitive data types": "Что такое примитивные типы данных?",
    "What are the validity properties": "Что такое validity-свойства?",
    "Give an example usage of the rangeOverflow property": "Приведите пример использования свойства rangeOverflow.",
    "What is the output of below spread operator array": "Какой будет результат выражения ниже со spread-оператором для массива?",
    "What are the problems with postmessage target origin as wildcard": "Какие проблемы возникают, если использовать wildcard как целевой origin для postMessage?",
    "What is the difference between Shallow and Deep copy": "В чем разница между shallow copy и deep copy?",
    "What is the output of below function calls": "Какой будет результат вызовов функций ниже?",
    "What happens if we add two arrays": "Что произойдет, если сложить два массива?",
    "What is the easiest multi condition checking": "Как проще всего проверить несколько условий?",
    "What is the difference between isNaN and Number.isNaN?": "В чем разница между isNaN() и Number.isNaN()?",
    "What are the differences between primitives and non-primitives?": "В чем разница между primitives и non-primitives?",
    "What are compose and pipe functions?": "Что такое функции compose() и pipe()?",
    "What are the examples of built-in higher order functions?": "Какие есть примеры встроенных функций высшего порядка?",
    "What is inline caching?": "Что такое inline caching?",
    "What is the purpose of requestAnimationFrame method?": "Для чего нужен метод requestAnimationFrame()?",
    "What is the purpose of Error object": "Для чего нужен объект Error?",
    "What is the purpose of EvalError object": "Для чего нужен объект EvalError?",
  }),
);

const phraseMap = [
  ["JavaScript", "JavaScript"],
  ["javascript", "JavaScript"],
  ["TypeScript", "TypeScript"],
  ["typescript", "TypeScript"],
  ["ECMAScript", "ECMAScript"],
  ["Promise.all", "Promise.all()"],
  ["promises", "Promise"],
  ["Promises", "Promise"],
  ["promise", "Promise"],
  ["callbacks", "callback-функций"],
  ["callback", "callback"],
  ["observables", "Observable"],
  ["observable", "Observable"],
  ["service worker", "Service Worker"],
  ["web workers", "Web Workers"],
  ["web worker", "Web Worker"],
  ["server-sent events", "Server-Sent Events"],
  ["server sent events", "Server-Sent Events"],
  ["local storage", "localStorage"],
  ["session storage", "sessionStorage"],
  ["web storage", "Web Storage"],
  ["postMessages", "postMessage"],
  ["postmessage", "postMessage"],
  ["post message", "postMessage"],
  ["cookie", "cookie"],
  ["cookies", "cookie"],
  ["event listeners", "event listeners"],
  ["event listener", "event listener"],
  ["event loop", "event loop"],
  ["event loops", "event loop"],
  ["event queue", "очередь событий"],
  ["microtask queue", "очередь microtask"],
  ["microTask queue", "очередь microtask"],
  ["microtask", "microtask"],
  ["tasks", "задачи"],
  ["queueMicrotask", "queueMicrotask()"],
  ["async function", "async-функция"],
  ["await", "await"],
  ["async", "async"],
  ["Node.js", "Node.js"],
  ["nodejs", "Node.js"],
  ["RxJS", "RxJS"],
  ["AJAX", "AJAX"],
  ["Babel", "Babel"],
  ["IndexedDB", "IndexedDB"],
  ["DOM", "DOM"],
  ["DOMContentLoaded", "DOMContentLoaded"],
  ["BOM", "BOM"],
  ["PWA", "PWA"],
  ["PWAs", "PWA"],
  ["URL", "URL"],
  ["HTML", "HTML"],
  ["CSS", "CSS"],
  ["JSON", "JSON"],
  ["V8 JavaScript engine", "движок JavaScript V8"],
  ["V8 engine", "движок V8"],
  ["Web Speech API", "Web Speech API"],
  ["requestAnimationFrame", "requestAnimationFrame()"],
  ["preventDefault", "preventDefault()"],
  ["setTimeout", "setTimeout()"],
  ["setInterval", "setInterval()"],
  ["setImmediate", "setImmediate()"],
  ["process.nextTick", "process.nextTick()"],
  ["isNaN", "isNaN()"],
  ["Number.isNaN", "Number.isNaN()"],
  ["getPrototype", "getPrototype()"],
  ["defineProperty", "defineProperty()"],
  ["getters", "геттеры"],
  ["setters", "сеттеры"],
  ["getter", "геттер"],
  ["setter", "сеттер"],
  ["prototype chain", "цепочка прототипов"],
  ["prototype", "prototype"],
  ["proto", "__proto__"],
  ["classes", "классы"],
  ["class", "класс"],
  ["constructor", "constructor"],
  ["parent class", "родительский класс"],
  ["mixins", "миксины"],
  ["mixin", "миксин"],
  ["Object", "Object"],
  ["Map", "Map"],
  ["Set", "Set"],
  ["WeakMap", "WeakMap"],
  ["WeakSet", "WeakSet"],
  ["array", "массив"],
  ["arrays", "массивы"],
  ["object", "объект"],
  ["objects", "объекты"],
  ["function", "функция"],
  ["functions", "функции"],
  ["first class function", "функция первого класса"],
  ["first order function", "функция первого порядка"],
  ["higher order function", "функция высшего порядка"],
  ["pure function", "чистая функция"],
  ["impure functions", "нечистые функции"],
  ["unary function", "унарная функция"],
  ["currying function", "каррированная функция"],
  ["lambda expressions", "lambda-выражения"],
  ["arrow functions", "стрелочные функции"],
  ["IIFE", "IIFE"],
  ["Immediately Invoked Function Expression", "Immediately Invoked Function Expression"],
  ["closures", "замыкания"],
  ["closure", "замыкание"],
  ["scope", "область видимости"],
  ["hoisting", "hoisting"],
  ["Temporal Dead Zone", "Temporal Dead Zone"],
  ["TDZ", "TDZ"],
  ["strict mode", "strict mode"],
  ["modules", "модули"],
  ["module loaders", "загрузчики модулей"],
  ["dynamic imports", "динамические импорты"],
  ["memoization", "мемоизация"],
  ["obfuscation", "обфускация"],
  ["minification", "минификация"],
  ["encryption", "шифрование"],
  ["shallow copy", "поверхностная копия"],
  ["deep copy", "глубокая копия"],
  ["spread operator", "spread-оператор"],
  ["rest parameter", "rest-параметр"],
  ["spread syntax", "spread-синтаксис"],
  ["optional chaining", "optional chaining"],
  ["nullish coalescing operator", "оператор nullish coalescing"],
  ["comma operator", "оператор запятая"],
  ["delete operator", "оператор delete"],
  ["void operator", "оператор void"],
  ["void 0", "void 0"],
  ["double exclamation", "двойное отрицание (!!)"],
  ["double tilde operator", "оператор двойной тильды (~~)"],
  ["EvalError", "EvalError"],
  ["error object", "объект ошибки"],
  ["syntax error", "SyntaxError"],
  ["call stack", "стек вызовов"],
  ["heap", "heap"],
  ["global execution context", "глобальный контекст выполнения"],
  ["function execution context", "контекст выполнения функции"],
  ["execution context", "контекст выполнения"],
  ["proper tail call", "proper tail call"],
  ["referential transparency", "ссылочная прозрачность"],
  ["side-effects", "побочные эффекты"],
  ["side effects", "побочные эффекты"],
  ["debouncing", "debouncing"],
  ["throttling", "throttling"],
  ["inline caching", "inline caching"],
  ["reflow", "reflow"],
  ["repaint", "repaint"],
  ["shim", "shim"],
  ["polyfill", "polyfill"],
  ["polyfills", "polyfill"],
  ["forEach", "forEach()"],
  ["map", "map()"],
  ["filter", "filter()"],
  ["reduce", "reduce()"],
  ["switch case", "switch-case"],
  ["switch-case", "switch-case"],
  ["break", "break"],
  ["continue", "continue"],
  ["Proxy", "Proxy"],
];

function cap(value) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}

function clean(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s+([?.,])/g, "$1")
    .trim();
}

function translatePhrase(value) {
  let result = clean(value)
    .replace(/^a\s+/i, "")
    .replace(/^an\s+/i, "")
    .replace(/^the\s+/i, "")
    .replace(/[?]$/g, "");

  const sorted = [...phraseMap].sort((a, b) => b[0].length - a[0].length);
  for (const [en, ru] of sorted) {
    result = result.replace(new RegExp(`\\b${escapeRegExp(en)}\\b`, "gi"), ru);
  }

  return clean(result)
    .replace(/\bmethod\b/gi, "метод")
    .replace(/\bmethods\b/gi, "методы")
    .replace(/\boperator\b/gi, "оператор")
    .replace(/\boperators\b/gi, "операторы")
    .replace(/\bproperty\b/gi, "свойство")
    .replace(/\bproperties\b/gi, "свойства")
    .replace(/\bparameter\b/gi, "параметр")
    .replace(/\bparameters\b/gi, "параметры")
    .replace(/\battribute\b/gi, "атрибут")
    .replace(/\battributes\b/gi, "атрибуты")
    .replace(/\bvalue\b/gi, "значение")
    .replace(/\bvalues\b/gi, "значения")
    .replace(/\boutput\b/gi, "результат")
    .replace(/\bsyntax\b/gi, "синтаксис")
    .replace(/\brules\b/gi, "правила")
    .replace(/\badvantages\b/gi, "преимущества")
    .replace(/\bbenefits\b/gi, "преимущества")
    .replace(/\bdifferences\b/gi, "различия")
    .replace(/\bdifference\b/gi, "разница")
    .replace(/\bpurpose\b/gi, "назначение")
    .replace(/\buse cases\b/gi, "сценарии использования")
    .replace(/\bways\b/gi, "способы")
    .replace(/\btypes\b/gi, "типы")
    .replace(/\bnames\b/gi, "имена")
    .replace(/\bphases\b/gi, "фазы")
    .replace(/\bstates\b/gi, "состояния")
    .replace(/\bwith\b/gi, "с")
    .replace(/\band\b/gi, "и")
    .replace(/\bor\b/gi, "или")
    .replace(/\bof\b/gi, "")
    .replace(/\bfor\b/gi, "для")
    .replace(/\bin\b/gi, "в")
    .replace(/\bon\b/gi, "в")
    .replace(/\bto\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function question(en) {
  const source = clean(en);
  if (exact.has(source)) return exact.get(source);

  let match;
  if ((match = source.match(/^What is the difference between (.+)$/i))) {
    return `В чем разница между ${translatePhrase(match[1])}?`;
  }
  if ((match = source.match(/^What are the differences between (.+)$/i))) {
    return `В чем различия между ${translatePhrase(match[1])}?`;
  }
  if ((match = source.match(/^What is (.+)$/i))) {
    return `Что такое ${translatePhrase(match[1])}?`;
  }
  if ((match = source.match(/^What are (.+)$/i))) {
    return `Что такое ${translatePhrase(match[1])}?`;
  }
  if ((match = source.match(/^What happens if (.+)$/i))) {
    return `Что произойдет, если ${translatePhrase(match[1])}?`;
  }
  if ((match = source.match(/^What happens with (.+)$/i))) {
    return `Что происходит при ${translatePhrase(match[1])}?`;
  }
  if ((match = source.match(/^What happens (.+)$/i))) {
    return `Что происходит, когда ${translatePhrase(match[1])}?`;
  }
  if ((match = source.match(/^Why do you need (.+)$/i))) {
    return `Зачем нужен ${translatePhrase(match[1])}?`;
  }
  if ((match = source.match(/^Why is it important to (.+)$/i))) {
    return `Почему важно ${translatePhrase(match[1])}?`;
  }
  if ((match = source.match(/^How do you (.+)$/i))) {
    return `Как ${translatePhrase(match[1])}?`;
  }
  if ((match = source.match(/^How to (.+)$/i))) {
    return `Как ${translatePhrase(match[1])}?`;
  }
  if ((match = source.match(/^How can you (.+)$/i))) {
    return `Как можно ${translatePhrase(match[1])}?`;
  }
  if ((match = source.match(/^Can I (.+)$/i))) {
    return `Можно ли ${translatePhrase(match[1])}?`;
  }
  if ((match = source.match(/^Can you (.+)$/i))) {
    return `Можно ли ${translatePhrase(match[1])}?`;
  }
  if ((match = source.match(/^Does (.+)$/i))) {
    return `${cap(translatePhrase(match[1]))}?`;
  }
  if ((match = source.match(/^Do (.+)$/i))) {
    return `${cap(translatePhrase(match[1]))}?`;
  }
  if ((match = source.match(/^Is (.+)$/i))) {
    return `${cap(translatePhrase(match[1]))}?`;
  }
  if ((match = source.match(/^Give an example(?: usage)? of (.+)$/i))) {
    return `Приведите пример использования ${translatePhrase(match[1])}.`;
  }
  if ((match = source.match(/^Explain (.+)$/i))) {
    return `Объясните ${translatePhrase(match[1])}.`;
  }

  return source;
}

const summary = { mode: write ? "write" : "dry-run", changed: 0, byFile: {} };

for (const file of fs.readdirSync(dataDir).filter((name) => name.endsWith(".json") && name !== "index.json").sort()) {
  const fullPath = path.join(dataDir, file);
  const deck = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  let changed = 0;

  for (const card of deck.cards || []) {
    const next = question(card.question?.en || "");
    if (!next || next === card.question?.ru) continue;
    card.question.ru = next;
    changed += 1;
  }

  if (write && changed) fs.writeFileSync(fullPath, `${JSON.stringify(deck, null, 2)}\n`);
  summary.changed += changed;
  summary.byFile[file] = changed;
}

console.log(JSON.stringify(summary, null, 2));
