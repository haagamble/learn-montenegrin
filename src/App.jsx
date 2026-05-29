import { useEffect, useMemo, useState } from 'react';
import { categories, learningItems } from './data/learningItems.js';
import PhraseCard from './components/PhraseCard.jsx';
import './App.css';

const reviewStorageKey = 'montenegrin-review-state';

const allCategories = {
  id: 'all',
  name: 'All',
  description: 'Review the full starter deck.'
};

const practiceCategory = {
  id: 'practice',
  name: 'Needs Practice',
  description: 'Cards you marked for more review.'
};

const typeFilters = [
  { id: 'all', label: 'All' },
  { id: 'words', label: 'Words' },
  { id: 'phrases', label: 'Phrases' },
  { id: 'sentences', label: 'Sentences' }
];

const difficultyFilters = [
  { id: 'all', label: 'All levels' },
  { id: '1', label: 'Beginner' },
  { id: '2', label: 'Intermediate' }
];

const conversationScenarios = [
  {
    id: 'cafe',
    name: 'Cafe',
    description: 'Ask for a table, order coffee and food, and close politely.',
    lines: [
      {
        speaker: 'You',
        goal: 'Greet the server.',
        english: 'Good day.',
        montenegrin: 'Dobar dan.',
        phonetic: 'DOH-bar dahn',
        variants: [
          {
            english: 'Good morning.',
            montenegrin: 'Dobro jutro.',
            phonetic: 'DOH-broh YOO-troh'
          },
          {
            english: 'Good evening.',
            montenegrin: 'Dobro veče.',
            phonetic: 'DOH-broh VEH-cheh'
          }
        ],
        practice: true
      },
      {
        speaker: 'Server',
        english: 'Good day. Go ahead.',
        montenegrin: 'Dobar dan. Izvolite.',
        phonetic: 'DOH-bar dahn Eez-VOH-lee-teh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask for a table for two.',
        english: 'A table for two, please.',
        montenegrin: 'Sto za dvije osobe, molim.',
        phonetic: 'stoh zah DVEE-yeh OH-soh-beh MOH-leem',
        practice: true
      },
      {
        speaker: 'Server',
        english: 'Of course. Here you go.',
        montenegrin: 'Naravno. Izvolite.',
        phonetic: 'nah-RAHV-noh eez-VOH-lee-teh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask for a coffee politely.',
        english: 'I would like coffee, please.',
        montenegrin: 'Htio bih kafu, molim.',
        phonetic: 'HTEE-oh beeh KAH-foo MOH-leem',
        practice: true
      },
      {
        speaker: 'Server',
        english: 'Would you like milk or sugar?',
        montenegrin: 'Želite li mlijeko ili šećer?',
        phonetic: 'ZHEH-lee-teh lee MLYEH-koh EE-lee SHEH-cher',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Answer how you want the coffee.',
        english: 'Without milk and sugar, please.',
        montenegrin: 'Bez mlijeka i šećera, molim.',
        phonetic: 'bez MLYEH-kah ee SHEH-cheh-rah MOH-leem',
        variants: [
          {
            english: 'Milk and sugar, thank you.',
            montenegrin: 'Sa mlijekom i šećerom, hvala.',
            phonetic: 'sah MLYEH-kohm ee SHEH-cheh-rom HVAH-lah'
          },
          {
            english: 'Milk only, please.',
            montenegrin: 'Samo mlijeko, molim.',
            phonetic: 'SAH-moh MLYEH-koh MOH-leem'
          },
          {
            english: 'Sugar only, please.',
            montenegrin: 'Samo šećer, molim.',
            phonetic: 'SAH-moh SHEH-cher MOH-leem'
          }
        ],
        practice: true
      },
      {
        speaker: 'Server',
        english: 'Anything else?',
        montenegrin: 'Još nešto?',
        phonetic: 'yohsh NESH-toh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask for something small to eat.',
        english: 'Do you have cake?',
        montenegrin: 'Imate li kolač?',
        phonetic: 'EE-mah-teh lee KOH-lach',
        variants: [
          {
            english: 'Do you have a sandwich?',
            montenegrin: 'Imate li sendvič?',
            phonetic: 'EE-mah-teh lee SEND-veech'
          },
          {
            english: 'Do you have bread?',
            montenegrin: 'Imate li hljeb?',
            phonetic: 'EE-mah-teh lee hlyeb'
          }
        ],
        practice: true
      },
      {
        speaker: 'Server',
        english: 'Of course.',
        montenegrin: 'Naravno.',
        phonetic: 'nah-RAHV-noh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask for the bill.',
        english: 'The bill, please.',
        montenegrin: 'Račun, molim.',
        phonetic: 'RAH-choon MOH-leem',
        practice: true
      },
      {
        speaker: 'Server',
        english: 'Here you go.',
        montenegrin: 'Izvolite.',
        phonetic: 'eez-VOH-lee-teh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Thank the server.',
        english: 'Thank you.',
        montenegrin: 'Hvala.',
        phonetic: 'HVAH-lah',
        practice: true
      }
    ]
  },
  {
    id: 'market',
    name: 'Market',
    description: 'Buy fruit, vegetables, and fish, then ask about price and quantity.',
    lines: [
      {
        speaker: 'You',
        goal: 'Greet the vendor.',
        english: 'Good day.',
        montenegrin: 'Dobar dan.',
        phonetic: 'DOH-bar dahn',
        variants: [
          {
            english: 'Good morning.',
            montenegrin: 'Dobro jutro.',
            phonetic: 'DOH-broh YOO-troh'
          }
        ],
        practice: true
      },
      {
        speaker: 'Vendor',
        english: 'Good day. Go ahead.',
        montenegrin: 'Dobar dan. Izvolite.',
        phonetic: 'DOH-bar dahn eez-VOH-lee-teh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask for the fruit you want.',
        english: 'Apples, please.',
        montenegrin: 'Jabuke, molim.',
        phonetic: 'YAH-boo-keh MOH-leem',
        variants: [
          {
            english: 'Bananas, please.',
            montenegrin: 'Banane, molim.',
            phonetic: 'bah-NAH-neh MOH-leem'
          },
          {
            english: 'Oranges, please.',
            montenegrin: 'Narandže, molim.',
            phonetic: 'nah-RAHN-jeh MOH-leem'
          }
        ],
        practice: true
      },
      {
        speaker: 'Vendor',
        english: 'How much would you like?',
        montenegrin: 'Koliko želite?',
        phonetic: 'KOH-lee-koh ZHEH-lee-teh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask for the quantity you want.',
        english: 'One kilo, please.',
        montenegrin: 'Jedan kilo, molim.',
        phonetic: 'YEH-dahn KEE-loh MOH-leem',
        variants: [
          {
            english: 'Half a kilo, please.',
            montenegrin: 'Pola kila, molim.',
            phonetic: 'POH-lah KEE-lah MOH-leem'
          },
          {
            english: 'Two kilos, please.',
            montenegrin: 'Dva kila, molim.',
            phonetic: 'dvah KEE-lah MOH-leem'
          }
        ],
        practice: true
      },
      {
        speaker: 'Vendor',
        english: 'Anything else?',
        montenegrin: 'Još nešto?',
        phonetic: 'yohsh NESH-toh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask for the vegetables you want.',
        english: 'Tomatoes, please.',
        montenegrin: 'Paradajz, molim.',
        phonetic: 'pah-rah-DAHYZ MOH-leem',
        variants: [
          {
            english: 'Potatoes, please.',
            montenegrin: 'Krompir, molim.',
            phonetic: 'KROM-peer MOH-leem'
          },
          {
            english: 'Cucumbers, please.',
            montenegrin: 'Krastavac, molim.',
            phonetic: 'KRAH-stah-vahts MOH-leem'
          },
          {
            english: 'Onions, please.',
            montenegrin: 'Luk, molim.',
            phonetic: 'look MOH-leem'
          }
        ],
        practice: true
      },
      {
        speaker: 'Vendor',
        english: 'Fresh fish is over there.',
        montenegrin: 'Svježa riba je tamo.',
        phonetic: 'SVYEH-zhah REE-bah yeh TAH-moh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask for fish.',
        english: 'Do you have fish?',
        montenegrin: 'Imate li ribu?',
        phonetic: 'EE-mah-teh lee REE-boo',
        variants: [
          {
            english: 'Fish, please.',
            montenegrin: 'Ribu, molim.',
            phonetic: 'REE-boo MOH-leem'
          },
          {
            english: 'Do you have seafood?',
            montenegrin: 'Imate li morske plodove?',
            phonetic: 'EE-mah-teh lee MOR-skeh PLOH-doh-veh'
          }
        ],
        practice: true
      },
      {
        speaker: 'Vendor',
        english: 'Yes, of course.',
        montenegrin: 'Da, naravno.',
        phonetic: 'dah nah-RAHV-noh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask how much a kilo costs.',
        english: 'How much does a kilo cost?',
        montenegrin: 'Koliko košta kilo?',
        phonetic: 'KOH-lee-koh KOH-shtah KEE-loh',
        variants: [
          {
            english: 'How much does it cost?',
            montenegrin: 'Koliko košta?',
            phonetic: 'KOH-lee-koh KOH-shtah'
          }
        ],
        practice: true
      },
      {
        speaker: 'Vendor',
        english: 'That is five euros.',
        montenegrin: 'To je pet eura.',
        phonetic: 'toh yeh pet EH-oo-rah',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask for the total.',
        english: 'How much is it total?',
        montenegrin: 'Koliko je ukupno?',
        phonetic: 'KOH-lee-koh yeh OO-koop-noh',
        variants: [
          {
            english: 'The bill, please.',
            montenegrin: 'Račun, molim.',
            phonetic: 'RAH-choon MOH-leem'
          }
        ],
        practice: true
      },
      {
        speaker: 'Vendor',
        english: 'Here you go.',
        montenegrin: 'Izvolite.',
        phonetic: 'eez-VOH-lee-teh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Thank the vendor and say goodbye.',
        english: 'Thank you. Goodbye.',
        montenegrin: 'Hvala. Doviđenja.',
        phonetic: 'HVAH-lah doh-vee-JEH-nyah',
        variants: [
          {
            english: 'Thank you.',
            montenegrin: 'Hvala.',
            phonetic: 'HVAH-lah'
          }
        ],
        practice: true
      }
    ]
  },
  {
    id: 'meeting',
    name: 'Meeting Someone',
    description: 'Introduce yourself, answer friendly questions, and close the conversation.',
    lines: [
      {
        speaker: 'You',
        goal: 'Greet someone politely.',
        english: 'Good day.',
        montenegrin: 'Dobar dan.',
        phonetic: 'DOH-bar dahn',
        variants: [
          {
            english: 'Hello.',
            montenegrin: 'Zdravo.',
            phonetic: 'ZDRAH-voh'
          },
          {
            english: 'Hi.',
            montenegrin: 'Ćao.',
            phonetic: 'chow'
          }
        ],
        practice: true
      },
      {
        speaker: 'Other person',
        english: 'Good day. How are you?',
        montenegrin: 'Dobar dan. Kako ste?',
        phonetic: 'DOH-bar dahn KAH-koh steh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Say how you are and ask back.',
        english: 'Fine, thank you. And you?',
        montenegrin: 'Dobro, hvala. A vi?',
        phonetic: 'DOH-broh HVAH-lah ah vee',
        variants: [
          {
            english: 'Fine, thank you.',
            montenegrin: 'Dobro, hvala.',
            phonetic: 'DOH-broh HVAH-lah'
          },
          {
            english: 'Fine, thank you. And you? (casual)',
            montenegrin: 'Dobro, hvala. A ti?',
            phonetic: 'DOH-broh HVAH-lah ah tee'
          }
        ],
        practice: true
      },
      {
        speaker: 'Other person',
        english: 'I am fine, thank you. What is your name?',
        montenegrin: 'Dobro sam, hvala. Kako se zovete?',
        phonetic: 'DOH-broh sahm HVAH-lah KAH-koh seh ZOH-veh-teh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Give your name.',
        english: 'My name is Ana.',
        montenegrin: 'Ime mi je Ana.',
        phonetic: 'EE-meh mee yeh AH-nah',
        variants: [
          {
            english: 'My name is Marko.',
            montenegrin: 'Ime mi je Marko.',
            phonetic: 'EE-meh mee yeh MAR-koh'
          },
          {
            english: 'My name is Sara.',
            montenegrin: 'Ime mi je Sara.',
            phonetic: 'EE-meh mee yeh SAH-rah'
          }
        ],
        practice: true
      },
      {
        speaker: 'Other person',
        english: 'Nice to meet you.',
        montenegrin: 'Drago mi je.',
        phonetic: 'DRAH-goh mee yeh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Say that it is nice to meet them too.',
        english: 'Nice to meet you too.',
        montenegrin: 'I meni je drago.',
        phonetic: 'ee MEH-nee yeh DRAH-goh',
        variants: [
          {
            english: 'Nice to meet you.',
            montenegrin: 'Drago mi je.',
            phonetic: 'DRAH-goh mee yeh'
          }
        ],
        practice: true
      },
      {
        speaker: 'Other person',
        english: 'Where are you from?',
        montenegrin: 'Odakle ste?',
        phonetic: 'oh-DAH-kleh steh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Say where you are from.',
        english: 'I am from the United States.',
        montenegrin: 'Ja sam iz Sjedinjenih Država.',
        phonetic: 'yah sahm eez syeh-DEE-nyeh-nee drah-ZHAH-vah',
        variants: [
          {
            english: 'I am from England.',
            montenegrin: 'Ja sam iz Engleske.',
            phonetic: 'yah sahm eez ENG-les-keh'
          },
          {
            english: 'I am not from here.',
            montenegrin: 'Nijesam odavde.',
            phonetic: 'NYEH-sahm oh-DAHV-deh'
          }
        ],
        practice: true
      },
      {
        speaker: 'Other person',
        english: 'Where do you live?',
        montenegrin: 'Gdje živite?',
        phonetic: 'gdyeh ZHEE-vee-teh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Say where you live.',
        english: 'I live in Podgorica.',
        montenegrin: 'Živim u Podgorici.',
        phonetic: 'ZHEE-veem oo pod-GOH-ree-tsee',
        variants: [
          {
            english: 'I live in Budva.',
            montenegrin: 'Živim u Budvi.',
            phonetic: 'ZHEE-veem oo BOOD-vee'
          },
          {
            english: 'I live in Kotor.',
            montenegrin: 'Živim u Kotoru.',
            phonetic: 'ZHEE-veem oo KOH-toh-roo'
          }
        ],
        practice: true
      },
      {
        speaker: 'Other person',
        english: 'See you.',
        montenegrin: 'Vidimo se.',
        phonetic: 'VEE-dee-moh seh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Say goodbye.',
        english: 'Goodbye.',
        montenegrin: 'Doviđenja.',
        phonetic: 'doh-vee-JEH-nyah',
        variants: [
          {
            english: 'See you.',
            montenegrin: 'Vidimo se.',
            phonetic: 'VEE-dee-moh seh'
          },
          {
            english: 'Bye.',
            montenegrin: 'Ćao.',
            phonetic: 'chow'
          }
        ],
        practice: true
      }
    ]
  },
  {
    id: 'hotel',
    name: 'Hotel',
    description: 'Check in, ask useful questions, and handle a small problem.',
    lines: [
      {
        speaker: 'You',
        goal: 'Greet reception in the evening.',
        english: 'Good evening.',
        montenegrin: 'Dobro veče.',
        phonetic: 'DOH-broh VEH-cheh',
        variants: [
          {
            english: 'Good day.',
            montenegrin: 'Dobar dan.',
            phonetic: 'DOH-bar dahn'
          }
        ],
        practice: true
      },
      {
        speaker: 'Reception',
        english: 'Good evening. Welcome.',
        montenegrin: 'Dobro veče. Dobro došli.',
        phonetic: 'DOH-broh VEH-cheh DOH-broh DOH-shlee',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Say that you have a reservation.',
        english: 'I have a reservation.',
        montenegrin: 'Imam rezervaciju.',
        phonetic: 'EE-mahm reh-zer-VAH-tsee-yoo',
        practice: true
      },
      {
        speaker: 'Reception',
        english: 'What is your name?',
        montenegrin: 'Kako se zovete?',
        phonetic: 'KAH-koh seh ZOH-veh-teh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Give your name.',
        english: 'My name is Ana.',
        montenegrin: 'Ime mi je Ana.',
        phonetic: 'EE-meh mee yeh AH-nah',
        practice: true
      },
      {
        speaker: 'Reception',
        english: 'Thank you.',
        montenegrin: 'Hvala.',
        phonetic: 'HVAH-lah',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask if breakfast is included.',
        english: 'Is breakfast included?',
        montenegrin: 'Da li je doručak uključen?',
        phonetic: 'dah lee yeh DOH-roo-chak ook-LYOO-chen',
        practice: true
      },
      {
        speaker: 'Reception',
        english: 'Yes, breakfast is included.',
        montenegrin: 'Da, doručak je uključen.',
        phonetic: 'dah DOH-roo-chak yeh ook-LYOO-chen',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask where the room is.',
        english: 'Where is the room?',
        montenegrin: 'Gdje je soba?',
        phonetic: 'gdyeh yeh SOH-bah',
        practice: true
      },
      {
        speaker: 'Reception',
        english: 'It is upstairs.',
        montenegrin: 'Gore je.',
        phonetic: 'GOH-reh yeh',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Explain that the key does not work.',
        english: 'The key does not work.',
        montenegrin: 'Ključ ne radi.',
        phonetic: 'klyooch neh RAH-dee',
        practice: true
      },
      {
        speaker: 'Reception',
        english: 'I will help you.',
        montenegrin: 'Pomoći ću vam.',
        phonetic: 'POH-moh-chee choo vahm',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask if you can leave your bag here.',
        english: 'Can I leave my bag here?',
        montenegrin: 'Mogu li ostaviti torbu ovdje?',
        phonetic: 'MOH-goo lee oh-STAH-vee-tee TOR-boo OHV-dyeh',
        practice: true
      }
    ]
  },
  {
    id: 'transport',
    name: 'Transport',
    description: 'Find the station, buy a ticket, and ask about departure.',
    lines: [
      {
        speaker: 'You',
        goal: 'Ask where the bus station is.',
        english: 'Where is the bus station?',
        montenegrin: 'Gdje je autobuska stanica?',
        phonetic: 'gdyeh yeh ow-toh-BOOS-kah STAH-nee-tsah',
        practice: true
      },
      {
        speaker: 'Local',
        english: 'It is near the center.',
        montenegrin: 'Blizu je centra.',
        phonetic: 'BLEE-zoo yeh TSEN-trah',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask where you can buy a ticket.',
        english: 'Where can I buy a ticket?',
        montenegrin: 'Gdje mogu kupiti kartu?',
        phonetic: 'gdyeh MOH-goo KOO-pee-tee KAR-too',
        practice: true
      },
      {
        speaker: 'Local',
        english: 'At the station.',
        montenegrin: 'Na stanici.',
        phonetic: 'nah STAH-nee-tsee',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask for one ticket.',
        english: 'I need a ticket.',
        montenegrin: 'Jednu kartu, molim.',
        phonetic: 'YEHD-noo KAR-too MOH-leem',
        practice: true
      },
      {
        speaker: 'Clerk',
        english: 'One ticket?',
        montenegrin: 'Jednu kartu?',
        phonetic: 'YEHD-noo KAR-too',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask when the bus leaves.',
        english: 'When does the bus leave?',
        montenegrin: 'Kada autobus polazi?',
        phonetic: 'KAH-dah OW-toh-boos poh-LAH-zee',
        practice: true
      },
      {
        speaker: 'Clerk',
        english: 'The bus leaves soon.',
        montenegrin: 'Autobus uskoro polazi.',
        phonetic: 'OW-toh-boos OO-skoh-roh poh-LAH-zee',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Ask if the bus goes to Kotor.',
        english: 'Does the bus go to Kotor?',
        montenegrin: 'Da li autobus ide za Kotor?',
        phonetic: 'dah lee OW-toh-boos EE-deh zah KOH-tor',
        practice: true
      },
      {
        speaker: 'Clerk',
        english: 'Yes, it goes to Kotor.',
        montenegrin: 'Da, ide za Kotor.',
        phonetic: 'dah EE-deh zah KOH-tor',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Say that you need a taxi.',
        english: 'I need a taxi.',
        montenegrin: 'Treba mi taksi.',
        phonetic: 'TREH-bah mee TAK-see',
        practice: true
      },
      {
        speaker: 'Clerk',
        english: 'A taxi is outside.',
        montenegrin: 'Taksi je napolju.',
        phonetic: 'TAK-see yeh nah-POH-lyoo',
        practice: false
      },
      {
        speaker: 'You',
        goal: 'Thank them.',
        english: 'Thank you.',
        montenegrin: 'Hvala.',
        phonetic: 'HVAH-lah',
        practice: true
      }
    ]
  }
];

const numberOrder = new Map(
  [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
    'hundred',
    'thousand'
  ].map((id, index) => [id, index])
);

function sortDeck(items, categoryId) {
  if (categoryId !== 'numbers') {
    return items;
  }

  return [...items].sort(
    (first, second) =>
      (numberOrder.get(first.id) ?? Number.MAX_SAFE_INTEGER) -
      (numberOrder.get(second.id) ?? Number.MAX_SAFE_INTEGER)
  );
}

function matchesTypeFilter(item, filterId) {
  if (filterId === 'all') {
    return true;
  }

  if (filterId === 'words') {
    return item.type === 'word' || item.type === 'verb';
  }

  if (filterId === 'phrases') {
    return item.type === 'phrase';
  }

  return item.type === 'sentence';
}

function matchesDifficultyFilter(item, filterId) {
  return filterId === 'all' || item.difficulty === Number(filterId);
}

function matchesSearch(item, searchQuery) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [item.english, item.montenegrin, item.phonetic].some((value) =>
    value.toLowerCase().includes(normalizedQuery)
  );
}

function shuffleItems(items) {
  return [...items]
    .map((item) => ({ item, sortValue: Math.random() }))
    .sort((first, second) => first.sortValue - second.sortValue)
    .map(({ item }) => item);
}

function loadReviewState() {
  try {
    return JSON.parse(localStorage.getItem(reviewStorageKey)) ?? {};
  } catch {
    return {};
  }
}

function App() {
  const [activeMode, setActiveMode] = useState('home');
  const [selectedScenarioId, setSelectedScenarioId] = useState(conversationScenarios[0].id);
  const [conversationIndex, setConversationIndex] = useState(0);
  const [isConversationRevealed, setIsConversationRevealed] = useState(false);
  const [conversationView, setConversationView] = useState('practice');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [promptSide, setPromptSide] = useState('english');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDeckComplete, setIsDeckComplete] = useState(false);
  const [studyView, setStudyView] = useState('cards');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [reviewState, setReviewState] = useState(loadReviewState);

  const categoryOptions = [allCategories, practiceCategory, ...categories];
  const selectedCategory =
    categoryOptions.find((category) => category.id === selectedCategoryId) ?? allCategories;
  const selectedScenario =
    conversationScenarios.find((scenario) => scenario.id === selectedScenarioId) ??
    conversationScenarios[0];
  const conversationPracticeLines = useMemo(
    () =>
      selectedScenario.lines
        .map((line, lineIndex) => ({
          ...line,
          lineIndex,
          contextLine: [...selectedScenario.lines]
            .slice(0, lineIndex)
            .reverse()
            .find((previousLine) => !previousLine.practice)
        }))
        .filter((line) => line.practice),
    [selectedScenario]
  );
  const currentConversationLine =
    conversationPracticeLines[conversationIndex] ?? conversationPracticeLines[0];
  const practiceIds = useMemo(
    () =>
      new Set(
        Object.entries(reviewState)
          .filter(([, value]) => value.status === 'practice')
          .map(([id]) => id)
      ),
    [reviewState]
  );

  const deck = useMemo(() => {
    let items;

    if (selectedCategoryId === 'all') {
      items = learningItems;
    } else if (selectedCategoryId === 'practice') {
      items = learningItems.filter((item) => practiceIds.has(item.id));
    } else {
      items = learningItems.filter((item) => item.categoryId === selectedCategoryId);
    }

    const filteredItems = items.filter(
      (item) =>
        matchesTypeFilter(item, typeFilter) &&
        matchesDifficultyFilter(item, difficultyFilter) &&
        matchesSearch(item, searchQuery)
    );

    if (studyView === 'list') {
      return sortDeck(filteredItems, selectedCategoryId);
    }

    return shuffleItems(filteredItems);
  }, [
    difficultyFilter,
    practiceIds,
    searchQuery,
    selectedCategoryId,
    shuffleSeed,
    studyView,
    typeFilter
  ]);

  const currentItem = deck[currentIndex] ?? deck[0];
  const phraseCount = learningItems.length;
  const practiceCount = practiceIds.size;
  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') {
      return learningItems.length;
    }

    if (categoryId === 'practice') {
      return practiceCount;
    }

    return learningItems.filter((item) => item.categoryId === categoryId).length;
  };

  useEffect(() => {
    localStorage.setItem(reviewStorageKey, JSON.stringify(reviewState));
  }, [reviewState]);

  useEffect(() => {
    if (deck.length > 0 && currentIndex > deck.length - 1) {
      setCurrentIndex(deck.length - 1);
    }
  }, [currentIndex, deck.length]);

  useEffect(() => {
    if (
      conversationPracticeLines.length > 0 &&
      conversationIndex > conversationPracticeLines.length - 1
    ) {
      setConversationIndex(conversationPracticeLines.length - 1);
      setIsConversationRevealed(false);
    }
  }, [conversationIndex, conversationPracticeLines.length]);

  const resetDeckPosition = () => {
    setCurrentIndex(0);
    setIsRevealed(false);
    setIsDeckComplete(false);
  };

  const chooseCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setShuffleSeed((value) => value + 1);
    resetDeckPosition();
  };

  const choosePromptSide = (side) => {
    setPromptSide(side);
    setIsRevealed(false);
    setIsDeckComplete(false);
  };

  const chooseTypeFilter = (filterId) => {
    setTypeFilter(filterId);
    setShuffleSeed((value) => value + 1);
    resetDeckPosition();
  };

  const chooseDifficultyFilter = (filterId) => {
    setDifficultyFilter(filterId);
    setShuffleSeed((value) => value + 1);
    resetDeckPosition();
  };

  const updateSearchQuery = (event) => {
    setSearchQuery(event.target.value);
    setShuffleSeed((value) => value + 1);
    resetDeckPosition();
  };

  const clearSearchQuery = () => {
    setSearchQuery('');
    setShuffleSeed((value) => value + 1);
    resetDeckPosition();
  };

  const chooseScenario = (scenarioId) => {
    setSelectedScenarioId(scenarioId);
    setConversationIndex(0);
    setIsConversationRevealed(false);
  };

  const moveToConversationLine = (nextIndex) => {
    setConversationIndex(nextIndex);
    setIsConversationRevealed(false);
  };

  const practiceConversationLine = (nextIndex) => {
    moveToConversationLine(nextIndex);
    setConversationView('practice');
  };

  const moveNextConversationLine = () => {
    moveToConversationLine(Math.min(conversationPracticeLines.length - 1, conversationIndex + 1));
  };

  const movePreviousConversationLine = () => {
    moveToConversationLine(Math.max(0, conversationIndex - 1));
  };

  const moveToCard = (nextIndex) => {
    setCurrentIndex(nextIndex);
    setIsRevealed(false);
    setIsDeckComplete(false);
  };

  const moveNext = () => {
    moveToCard(Math.min(deck.length - 1, currentIndex + 1));
  };

  const movePrevious = () => {
    moveToCard(Math.max(0, currentIndex - 1));
  };

  const markCard = (status) => {
    if (!currentItem) {
      return;
    }

    setReviewState((current) => {
      const existing = current[currentItem.id] ?? { correct: 0, missed: 0 };
      const next = {
        ...current,
        [currentItem.id]: {
          status,
          correct: existing.correct + (status === 'known' ? 1 : 0),
          missed: existing.missed + (status === 'practice' ? 1 : 0),
          lastReviewedAt: new Date().toISOString()
        }
      };

      return next;
    });

    if (currentIndex < deck.length - 1) {
      moveToCard(currentIndex + 1);
    } else {
      setIsRevealed(false);
      setIsDeckComplete(true);
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Montenegrin learner</p>
          <h1>{activeMode === 'home' ? 'Choose a practice mode' : 'Focused Montenegrin practice'}</h1>
          <p className="hero-copy">
            {activeMode === 'home'
              ? 'Build recall now, with conversation practice ready to grow next.'
              : 'Choose a deck and practice recall from either language.'}
          </p>
        </div>
        <div className="hero-stats" aria-label="Starter curriculum">
          <span>
            <strong>{phraseCount}</strong>
            words and phrases
          </span>
          <span>
            <strong>{practiceCount}</strong>
            to practice
          </span>
        </div>
      </header>

      {activeMode === 'home' ? (
        <main className="home-screen">
          <section className="mode-grid" aria-label="Practice modes">
            <button type="button" className="mode-card" onClick={() => setActiveMode('flashcards')}>
              <span className="mode-kicker">Study now</span>
              <strong>Flashcards</strong>
              <span>Practice words, phrases, and sentences by deck.</span>
              <span className="mode-count">{phraseCount} items</span>
            </button>

            <button
              type="button"
              className="mode-card mode-card-secondary"
              onClick={() => setActiveMode('conversation')}
            >
              <span className="mode-kicker">Practice scenes</span>
              <strong>Conversation Practice</strong>
              <span>Practice your lines inside short real-life dialogs.</span>
              <span className="mode-count">{conversationScenarios.length} scenarios</span>
            </button>
          </section>
        </main>
      ) : activeMode === 'conversation' ? (
        <main className="conversation-layout">
          <aside className="scenario-panel" aria-label="Conversation scenarios">
            <div className="screen-toolbar">
              <button type="button" className="back-button" onClick={() => setActiveMode('home')}>
                Back
              </button>
            </div>
            <div className="panel-heading">
              <h2>Scenarios</h2>
              <p>{selectedScenario.description}</p>
            </div>
            <div className="scenario-list">
              {conversationScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  className={scenario.id === selectedScenarioId ? 'is-active' : ''}
                  onClick={() => chooseScenario(scenario.id)}
                >
                  <span>{scenario.name}</span>
                  <strong>{scenario.lines.filter((line) => line.practice).length}</strong>
                </button>
              ))}
            </div>
          </aside>

          <section className="conversation-panel">
            <div className="mobile-deck-picker">
              <label htmlFor="mobile-scenario-select">Scenario</label>
              <select
                id="mobile-scenario-select"
                value={selectedScenarioId}
                onChange={(event) => chooseScenario(event.target.value)}
              >
                {conversationScenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.name} ({scenario.lines.filter((line) => line.practice).length})
                  </option>
                ))}
              </select>
              <p>{selectedScenario.description}</p>
            </div>

            <div className="section-head">
              <div>
                <h2>{selectedScenario.name}</h2>
                <p>
                  {conversationView === 'practice'
                    ? 'Practice one learner turn at a time.'
                    : 'Preview or review the full dialogue.'}
                </p>
              </div>
              <div className="session-meter" aria-label="Conversation line">
                <span>Your turn</span>
                <strong>
                  {conversationPracticeLines.length > 0 ? conversationIndex + 1 : 0} of{' '}
                  {conversationPracticeLines.length}
                </strong>
              </div>
            </div>

            <div className="segmented-control conversation-view-toggle" aria-label="Conversation view">
              <button
                type="button"
                className={conversationView === 'practice' ? 'is-active' : ''}
                onClick={() => setConversationView('practice')}
              >
                Practice
              </button>
              <button
                type="button"
                className={conversationView === 'dialogue' ? 'is-active' : ''}
                onClick={() => setConversationView('dialogue')}
              >
                Full dialogue
              </button>
            </div>

            {conversationView === 'practice' && currentConversationLine ? (
              <>
                <div className="conversation-card">
                  {currentConversationLine.contextLine && !isConversationRevealed ? (
                    <div className="conversation-context">
                      <span>{currentConversationLine.contextLine.speaker}</span>
                      <strong>{currentConversationLine.contextLine.montenegrin}</strong>
                      <small>{currentConversationLine.contextLine.english}</small>
                    </div>
                  ) : null}
                  <div className="conversation-goal">
                    <span className="phrase-label">{currentConversationLine.speaker} · Goal</span>
                    <strong>{currentConversationLine.goal ?? currentConversationLine.english}</strong>
                  </div>
                  {isConversationRevealed ? (
                    <>
                      <span className="conversation-answer">
                        <span>{currentConversationLine.montenegrin}</span>
                        <small>
                          {currentConversationLine.phonetic} · {currentConversationLine.english}
                        </small>
                      </span>
                      {currentConversationLine.variants?.length > 0 ? (
                        <div className="conversation-variants" aria-label="Other good answers">
                          <span>Other good answers</span>
                          {currentConversationLine.variants.map((variant) => (
                            <div
                              key={`${variant.montenegrin}-${variant.english}`}
                              className="conversation-variant"
                            >
                              <strong>{variant.montenegrin}</strong>
                              <small>
                                {variant.phonetic} · {variant.english}
                              </small>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <span className="phrase-support">Think of your Montenegrin line.</span>
                  )}
                </div>

                <div className="study-actions">
                  <button
                    type="button"
                    onClick={movePreviousConversationLine}
                    disabled={conversationIndex === 0}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="reveal-button"
                    onClick={() => setIsConversationRevealed((value) => !value)}
                  >
                    {isConversationRevealed ? 'Hide answer' : 'Reveal answer'}
                  </button>
                  <button
                    type="button"
                    onClick={moveNextConversationLine}
                    disabled={conversationIndex === conversationPracticeLines.length - 1}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : conversationView === 'dialogue' ? (
              <div className="conversation-transcript" aria-label={`${selectedScenario.name} transcript`}>
                {selectedScenario.lines.map((line, index) => {
                  const practiceIndex = conversationPracticeLines.findIndex(
                    (practiceLine) => practiceLine.lineIndex === index
                  );
                  const isActivePracticeLine = practiceIndex === conversationIndex;

                  return line.practice ? (
                    <button
                      key={`${selectedScenario.id}-${index}`}
                      type="button"
                      className={[
                        'transcript-line',
                        'is-practice',
                        isActivePracticeLine ? 'is-active' : ''
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => practiceConversationLine(practiceIndex)}
                    >
                      <span>{line.speaker}</span>
                      <strong>{line.goal ?? line.english}</strong>
                      <small>{line.montenegrin}</small>
                    </button>
                  ) : (
                    <div
                      key={`${selectedScenario.id}-${index}`}
                      className="transcript-line is-context"
                    >
                      <span>{line.speaker}</span>
                      <strong>{line.english}</strong>
                      <small>{line.montenegrin}</small>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-practice">
                <h3>No lines in this scenario</h3>
                <p>Choose another scenario.</p>
              </div>
            )}
          </section>
        </main>
      ) : (
        <main className="learning-layout">
        <aside className="category-panel" aria-label="Categories">
          <div className="panel-heading">
            <h2>Study Decks</h2>
            <p>{selectedCategory.description}</p>
          </div>
          <div className="category-list">
            {categoryOptions.map((category) => (
              <button
                key={category.id}
                type="button"
                className={[
                  category.id === selectedCategoryId ? 'is-active' : '',
                  category.id === 'practice' ? 'is-practice-deck' : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => chooseCategory(category.id)}
              >
                <span>{category.name}</span>
                <strong>{getCategoryCount(category.id)}</strong>
              </button>
            ))}
          </div>
        </aside>

        <section className="practice-panel">
          <div className="screen-toolbar">
            <button type="button" className="back-button" onClick={() => setActiveMode('home')}>
              Back
            </button>
          </div>

          <div className="mobile-deck-picker">
            <label htmlFor="mobile-deck-select">Deck</label>
            <select
              id="mobile-deck-select"
              value={selectedCategoryId}
              onChange={(event) => chooseCategory(event.target.value)}
            >
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({getCategoryCount(category.id)})
                </option>
              ))}
            </select>
            <p>{selectedCategory.description}</p>
          </div>

          <div className="section-head">
            <div>
              <h2>{studyView === 'cards' ? 'Flashcards' : 'Word List'}</h2>
              <p>
                {selectedCategory.name} deck ·{' '}
                {typeFilters.find((filter) => filter.id === typeFilter)?.label ?? 'All'} ·{' '}
                {difficultyFilters.find((filter) => filter.id === difficultyFilter)?.label ??
                  'All levels'}
              </p>
            </div>
            {studyView === 'cards' ? (
              <div className="session-meter" aria-label="Deck position">
                <span>Card</span>
                <strong>{deck.length > 0 ? currentIndex + 1 : 0} of {deck.length}</strong>
              </div>
            ) : (
              <div className="session-meter" aria-label="Deck size">
                <span>Total</span>
                <strong>{deck.length} items</strong>
              </div>
            )}
          </div>

          <div className="study-toolbar" aria-label="Study view">
            <div className="segmented-control">
              <button
                type="button"
                className={studyView === 'cards' ? 'is-active' : ''}
                onClick={() => setStudyView('cards')}
              >
                Cards
              </button>
              <button
                type="button"
                className={studyView === 'list' ? 'is-active' : ''}
                onClick={() => setStudyView('list')}
              >
                List
              </button>
            </div>

            {studyView === 'cards' && (
              <div className="segmented-control" aria-label="Prompt direction">
                <button
                  type="button"
                  className={promptSide === 'english' ? 'is-active' : ''}
                  onClick={() => choosePromptSide('english')}
                >
                  English first
                </button>
                <button
                  type="button"
                  className={promptSide === 'montenegrin' ? 'is-active' : ''}
                  onClick={() => choosePromptSide('montenegrin')}
                >
                  Montenegrin first
                </button>
              </div>
            )}
          </div>

          <div className="search-box" role="search">
            <label htmlFor="phrase-search">Search phrases</label>
            <div className="search-input-wrap">
              <input
                id="phrase-search"
                type="search"
                value={searchQuery}
                onChange={updateSearchQuery}
                placeholder="Search English, Montenegrin, or phonetic..."
              />
              {searchQuery && (
                <button type="button" onClick={clearSearchQuery}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <span>Type</span>
              <div className="type-filter" aria-label="Card type">
                {typeFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className={typeFilter === filter.id ? 'is-active' : ''}
                    onClick={() => chooseTypeFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <span>Level</span>
              <div className="type-filter" aria-label="Difficulty">
                {difficultyFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className={difficultyFilter === filter.id ? 'is-active' : ''}
                    onClick={() => chooseDifficultyFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {studyView === 'list' ? (
            deck.length > 0 ? (
              <div className="word-list" aria-label={`${selectedCategory.name} words`}>
                {deck.map((item) => (
                  <article key={item.id} className="word-row">
                    <div>
                      <h3>{item.montenegrin}</h3>
                      <p>{item.phonetic}</p>
                    </div>
                    <div>
                      <strong>{item.english}</strong>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-practice">
                <h3>{searchQuery ? `No matches for "${searchQuery}"` : 'No cards in this deck'}</h3>
                <p>
                  {searchQuery
                    ? 'Try a broader search or adjust the selected filters.'
                    : 'Try a different card type or choose another deck.'}
                </p>
              </div>
            )
          ) : isDeckComplete ? (
            <div className="deck-complete">
              <span className="complete-kicker">Deck complete</span>
              <h3>Nice work. You reviewed {deck.length} cards.</h3>
              <p>
                {practiceCount > 0
                  ? `${practiceCount} cards are waiting in Needs Practice.`
                  : 'No cards are waiting in Needs Practice.'}
              </p>
              <div className="complete-actions">
                <button type="button" onClick={resetDeckPosition}>
                  Review again
                </button>
                <button
                  type="button"
                  className="practice-button"
                  onClick={() => chooseCategory('practice')}
                  disabled={practiceCount === 0}
                >
                  Practice misses
                </button>
              </div>
            </div>
          ) : currentItem ? (
            <>
              <div className="card-frame">
                <PhraseCard
                  item={currentItem}
                  promptSide={promptSide}
                  isRevealed={isRevealed}
                  onFlip={() => setIsRevealed((value) => !value)}
                />
              </div>

              <div className="study-actions">
                {!isRevealed ? (
                  <>
                    <button type="button" onClick={movePrevious} disabled={currentIndex === 0}>
                      Previous
                    </button>
                    <button
                      type="button"
                      className="reveal-button"
                      onClick={() => setIsRevealed(true)}
                    >
                      Reveal answer
                    </button>
                    <button
                      type="button"
                      onClick={moveNext}
                      disabled={currentIndex === deck.length - 1}
                    >
                      Next
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="practice-button"
                      onClick={() => markCard('practice')}
                    >
                      Need practice
                    </button>
                    <button type="button" className="known-button" onClick={() => markCard('known')}>
                      Know it
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="empty-practice">
              <h3>{searchQuery ? `No matches for "${searchQuery}"` : 'No cards in this deck'}</h3>
              <p>
                {searchQuery
                  ? 'Try a broader search or adjust the selected filters.'
                  : 'Try a different card type or choose another deck.'}
              </p>
            </div>
          )}
        </section>
      </main>
      )}
    </div>
  );
}

export default App;
