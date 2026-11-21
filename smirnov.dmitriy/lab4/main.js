import {
  Event,
  findEventsByMonth,
  findEventsByParticipant,
  getUniqueParticipants,
  groupEventsByDate,
  groupEventsByParticipantCount,
} from './model.js';

const storageKey = 'smirnov.dmitriy.lab4.events';

const eventForm = document.querySelector('[data-testid="entity-form"]');
const eventList = document.querySelector('[data-testid="entity-list"]');
const template = document.querySelector('#event-template');
const message = document.querySelector('[data-testid="message"]');
const filterStatus = document.querySelector('[data-testid="filter-status"]');

const participantSearchForm = document.querySelector(
  '[data-testid="participant-search-form"]',
);

const monthSearchForm = document.querySelector(
  '[data-testid="month-search-form"]',
);

const resetFilterButton = document.querySelector(
  '[data-testid="reset-filter"]',
);

const uniqueParticipants = document.querySelector(
  '[data-testid="unique-participants"]',
);

const dateGroups = document.querySelector('[data-testid="group-by-date"]');

const countGroups = document.querySelector('[data-testid="group-by-count"]');

let events = loadEvents();
let visibleEvents = [...events];

function loadEvents() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');

    if (!Array.isArray(saved)) {
      return [];
    }

    return saved.map(
      (item) => new Event(item.id, item.title, item.participants, item.date),
    );
  } catch {
    return [];
  }
}

function saveEvents() {
  localStorage.setItem(storageKey, JSON.stringify(events));
}

function runAsync(callback) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(callback());
    }, 100);
  });
}

function renderStatistics() {
  uniqueParticipants.replaceChildren();
  dateGroups.replaceChildren();
  countGroups.replaceChildren();

  getUniqueParticipants(events).forEach((name) => {
    const item = document.createElement('li');
    item.textContent = name;
    uniqueParticipants.append(item);
  });

  Object.entries(groupEventsByDate(events)).forEach(([date, items]) => {
    const item = document.createElement('li');
    item.textContent = `${date}: ${items.length}`;
    dateGroups.append(item);
  });

  Object.entries(groupEventsByParticipantCount(events)).forEach(
    ([count, items]) => {
      const item = document.createElement('li');
      item.textContent = `${count} участников: ${items.length}`;
      countGroups.append(item);
    },
  );
}

function render() {
  eventList.replaceChildren();

  visibleEvents.forEach((item) => {
    const fragment = template.content.cloneNode(true);

    const card = fragment.querySelector('[data-testid="entity-card"]');

    card.querySelector('.title').textContent = item.title;
    card.querySelector('.id').textContent = item.id;
    card.querySelector('.date').textContent = item.date;
    card.querySelector('.count').textContent = item.participantCount;

    const participantsList = card.querySelector('.participants');

    item.participants.forEach((name) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${name} `;

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.textContent = 'Удалить участника';

      removeButton.addEventListener('click', async () => {
        await runAsync(() => item.removeParticipant(name));

        saveEvents();
        renderAll();

        message.textContent = 'Участник удалён';
      });

      listItem.append(removeButton);
      participantsList.append(listItem);
    });

    card
      .querySelector('.participant-form')
      .addEventListener('submit', async (submitEvent) => {
        submitEvent.preventDefault();

        const input = submitEvent.currentTarget.elements.participant;
        const name = input.value.trim();

        if (!name) {
          return;
        }

        const added = await runAsync(() => item.addParticipant(name));

        saveEvents();
        renderAll();

        message.textContent = added
          ? 'Участник добавлен'
          : 'Такой участник уже есть';

        input.value = '';
      });

    card
      .querySelector('[data-testid="delete-entity"]')
      .addEventListener('click', async () => {
        await runAsync(() => {
          events = events.filter((current) => current.id !== item.id);

          visibleEvents = visibleEvents.filter(
            (current) => current.id !== item.id,
          );
        });

        saveEvents();
        renderAll();

        message.textContent = 'Мероприятие удалено';
      });

    eventList.append(fragment);
  });

  renderStatistics();
}

function renderAll() {
  render();
}

eventForm.addEventListener('submit', async (submitEvent) => {
  submitEvent.preventDefault();

  const id = Number(eventForm.elements.id.value);
  const title = eventForm.elements.title.value.trim();
  const date = eventForm.elements.date.value;

  if (!Number.isInteger(id) || id <= 0 || !title || !date) {
    message.textContent = 'Заполни все поля корректно';
    return;
  }

  if (events.some((item) => item.id === id)) {
    message.textContent = 'Мероприятие с таким ID уже существует';
    return;
  }

  await runAsync(() => {
    events.push(new Event(id, title, [], date));
  });

  saveEvents();

  visibleEvents = [...events];

  eventForm.reset();

  filterStatus.textContent = 'Показаны все мероприятия';

  renderAll();

  message.textContent = 'Мероприятие добавлено';
});

participantSearchForm.addEventListener('submit', (submitEvent) => {
  submitEvent.preventDefault();

  const name = participantSearchForm.elements.participant.value.trim();

  visibleEvents = findEventsByParticipant(events, name);

  filterStatus.textContent = `Найдено мероприятий: ${visibleEvents.length}`;

  render();
});

monthSearchForm.addEventListener('submit', (submitEvent) => {
  submitEvent.preventDefault();

  const month = Number(monthSearchForm.elements.month.value);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    message.textContent = 'Укажи месяц от 1 до 12';
    return;
  }

  visibleEvents = findEventsByMonth(events, month);

  filterStatus.textContent = `Найдено мероприятий: ${visibleEvents.length}`;

  render();
});

resetFilterButton.addEventListener('click', () => {
  visibleEvents = [...events];

  filterStatus.textContent = 'Показаны все мероприятия';

  message.textContent = '';

  render();
});

renderAll();
