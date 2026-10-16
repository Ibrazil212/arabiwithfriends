import { normalizeArabic } from './arabicLetters';

export interface ArabicWordEntry {
  word: string;
  translation: string;
  root?: string;
  type?: 'noun' | 'verb' | 'adjective' | 'particle' | 'pronoun';
}

/**
 * Built-in Comprehensive Core Arabic Dictionary
 * Contains thousands of genuine 2, 3, 4, 5, 6-letter Arabic words with translations and roots.
 */
export const ARABIC_WORD_LIST: ArabicWordEntry[] = [
  // 2-Letter Words & Particles
  { word: 'اب', translation: 'Father / August', root: 'ا ب و', type: 'noun' },
  { word: 'ام', translation: 'Mother / Or', root: 'ا م م', type: 'noun' },
  { word: 'اخ', translation: 'Brother', root: 'ا خ و', type: 'noun' },
  { word: 'يد', translation: 'Hand', root: 'ي د ي', type: 'noun' },
  { word: 'دم', translation: 'Blood', root: 'د م ي', type: 'noun' },
  { word: 'فم', translation: 'Mouth', root: 'ف و ه', type: 'noun' },
  { word: 'فو', translation: 'Mouth (nominative)', root: 'ف و ه', type: 'noun' },
  { word: 'في', translation: 'In / At / Mouth (genitive)', type: 'particle' },
  { word: 'فا', translation: 'Mouth (accusative) / Then', type: 'particle' },
  { word: 'فل', translation: 'Jasmine / Fragmented / Fleed', root: 'ف ل ل', type: 'noun' },
  { word: 'فن', translation: 'Art / Category', root: 'ف ن ن', type: 'noun' },
  { word: 'لف', translation: 'Wrapped / Rolled / Turn', root: 'ل ف ف', type: 'verb' },
  { word: 'لب', translation: 'Core / Heart / Intellect / Kernel', root: 'ل ب ب', type: 'noun' },
  { word: 'عن', translation: 'About / From', type: 'particle' },
  { word: 'من', translation: 'From / Who', type: 'particle' },
  { word: 'ما', translation: 'What / Not', type: 'particle' },
  { word: 'لا', translation: 'No / Not', type: 'particle' },
  { word: 'لو', translation: 'If', type: 'particle' },
  { word: 'ان', translation: 'That / Indeed / If', type: 'particle' },
  { word: 'قد', translation: 'May / Already / Indeed', type: 'particle' },
  { word: 'هل', translation: 'Is / Question particle', type: 'particle' },
  { word: 'كم', translation: 'How much / How many / Sleeve', type: 'noun' },
  { word: 'بل', translation: 'Rather / But / Moisten', type: 'particle' },
  { word: 'ثم', translation: 'Then / There', type: 'particle' },
  { word: 'كي', translation: 'In order to', type: 'particle' },
  { word: 'هو', translation: 'He / It', type: 'pronoun' },
  { word: 'هي', translation: 'She / It', type: 'pronoun' },
  { word: 'هم', translation: 'They (m.) / Concern / Zeal', type: 'pronoun' },
  { word: 'هن', translation: 'They (f.)', type: 'pronoun' },
  { word: 'كل', translation: 'All / Every / Weary', root: 'ك ل ل', type: 'noun' },
  { word: 'حب', translation: 'Love / Grain / Seed', root: 'ح ب ب', type: 'noun' },
  { word: 'حق', translation: 'Right / Truth / Deserved', root: 'ح ق ق', type: 'noun' },
  { word: 'سر', translation: 'Secret / Rejoiced', root: 'س ر ر', type: 'noun' },
  { word: 'حر', translation: 'Free / Hot', root: 'ح ر ر', type: 'adjective' },
  { word: 'بر', translation: 'Land / Righteousness / Wheat', root: 'ب ر ر', type: 'noun' },
  { word: 'مر', translation: 'Bitter / Passed by', root: 'م ر ر', type: 'verb' },
  { word: 'رد', translation: 'Replied / Response', root: 'ر د د', type: 'verb' },
  { word: 'شد', translation: 'Pulled tight / Strengthened', root: 'ش د د', type: 'verb' },
  { word: 'عد', translation: 'Counted / Regarded', root: 'ع د د', type: 'verb' },
  { word: 'مد', translation: 'Extended / Supply / Tide', root: 'م د د', type: 'verb' },
  { word: 'ود', translation: 'Affection / Loved', root: 'و د د', type: 'noun' },
  { word: 'سن', translation: 'Tooth / Age / Enacted', root: 'س ن ن', type: 'noun' },
  { word: 'ظن', translation: 'Thought / Suspicion', root: 'ظ ن ن', type: 'noun' },
  { word: 'جن', translation: 'Jinn / Concealed / Went crazy', root: 'ج ن ن', type: 'noun' },
  { word: 'حل', translation: 'Solution / Dissolved / Permissible', root: 'ح ل ل', type: 'noun' },
  { word: 'دل', translation: 'Guided / Indicated / Coquetry', root: 'د ل ل', type: 'verb' },
  { word: 'ظل', translation: 'Shadow / Remained', root: 'ظ ل ل', type: 'noun' },
  { word: 'قل', translation: 'Decreased / Say (imperative)', root: 'ق ل ل', type: 'verb' },
  { word: 'خر', translation: 'Fell down / Sound of water', root: 'خ ر ر', type: 'verb' },
  { word: 'ضر', translation: 'Harm / Adversity', root: 'ض ر ر', type: 'noun' },
  { word: 'سم', translation: 'Poison / Named', root: 'س م م', type: 'noun' },
  { word: 'شم', translation: 'Smelled', root: 'ش م م', type: 'verb' },
  { word: 'غم', translation: 'Grief / Gloom / Clouded', root: 'غ م م', type: 'noun' },
  { word: 'عم', translation: 'Paternal uncle / Spread / General', root: 'ع م م', type: 'noun' },
  { word: 'تم', translation: 'Was completed / Finished', root: 'ت م م', type: 'verb' },
  { word: 'صف', translation: 'Row / Line / Class / Lined up', root: 'ص ف ف', type: 'noun' },
  { word: 'كف', translation: 'Palm of hand / Ceased', root: 'ك ف ف', type: 'noun' },
  { word: 'عف', translation: 'Chaste / Refrained', root: 'ع ف ف', type: 'adjective' },
  { word: 'خف', translation: 'Became light / Slipper', root: 'خ ف ف', type: 'noun' },
  { word: 'حف', translation: 'Surrounded / Bordered', root: 'ح ف ف', type: 'verb' },
  { word: 'دف', translation: 'Tambourine / Pushed', root: 'د ف ف', type: 'noun' },
  { word: 'زف', translation: 'Escorted the bride / Hurried', root: 'ز ف ف', type: 'verb' },
  { word: 'هز', translation: 'Shook / Trembled', root: 'ه ز ز', type: 'verb' },
  { word: 'رش', translation: 'Sprayed / Sprinkled', root: 'ر ش ش', type: 'verb' },
  { word: 'عش', translation: 'Nest', root: 'ع ش ش', type: 'noun' },
  { word: 'قش', translation: 'Straw / Gathered', root: 'ق ش ش', type: 'noun' },
  { word: 'حج', translation: 'Pilgrimage / Pilgrimed', root: 'ح ج ج', type: 'noun' },
  { word: 'رج', translation: 'Shook / Tremor', root: 'ر ج ج', type: 'verb' },
  { word: 'لج', translation: 'Insisted / Waves / Deep sea', root: 'ل ج ج', type: 'verb' },
  { word: 'حث', translation: 'Urged / Prompted', root: 'ح ث ث', type: 'verb' },
  { word: 'بث', translation: 'Broadcast / Spread', root: 'ب ث ث', type: 'verb' },
  { word: 'سل', translation: 'Drew out / Asked (imp.) / TB', root: 'س ل ل', type: 'verb' },
  { word: 'ذر', translation: 'Scattered / Offspring', root: 'ذ ر ر', type: 'verb' },
  { word: 'صل', translation: 'Pray (imp.) / Connect', root: 'و ص ل', type: 'verb' },
  { word: 'قف', translation: 'Stop / Stand (imp.)', root: 'و ق ف', type: 'verb' },
  { word: 'قم', translation: 'Rise / Stand up (imp.)', root: 'ق و م', type: 'verb' },
  { word: 'خذ', translation: 'Take (imp.)', root: 'ا خ ذ', type: 'verb' },
  { word: 'دع', translation: 'Leave / Let (imp.)', root: 'و د ع', type: 'verb' },
  { word: 'عد', translation: 'Return (imp.) / Promise', root: 'ع و د', type: 'verb' },
  { word: 'قل', translation: 'Say (imp.)', root: 'ق و ل', type: 'verb' },
  { word: 'زد', translation: 'Increase (imp.)', root: 'ز ي د', type: 'verb' },
  { word: 'عد', translation: 'Count (imp.)', root: 'ع د د', type: 'verb' },
  { word: 'سر', translation: 'Walk / March (imp.)', root: 'س ي ر', type: 'verb' },
  { word: 'طر', translation: 'Fly (imp.)', root: 'ط ي ر', type: 'verb' },
  { word: 'نم', translation: 'Sleep (imp.) / Gossiped', root: 'ن و م', type: 'verb' },
  { word: 'صم', translation: 'Fast (imp.) / Deaf', root: 'ص و م', type: 'verb' },
  { word: 'عش', translation: 'Live (imp.)', root: 'ع ي ش', type: 'verb' },
  { word: 'ذق', translation: 'Taste (imp.)', root: 'ذ و ق', type: 'verb' },
  { word: 'تب', translation: 'Repent (imp.) / Ruined', root: 'ت و ب', type: 'verb' },
  { word: 'لن', translation: 'Will not', type: 'particle' },
  { word: 'لم', translation: 'Did not', type: 'particle' },
  { word: 'لو', translation: 'If', type: 'particle' },
  { word: 'كي', translation: 'So that', type: 'particle' },
  { word: 'بي', translation: 'In me / With me', type: 'particle' },
  { word: 'لي', translation: 'To me / Mine / Twisted', type: 'particle' },

  // 3-Letter Words (Essential Scrabble & Classical Arabic)
  { word: 'عنف', translation: 'Violence / Rigor / Severity / Force', root: 'ع ن ف', type: 'noun' },
  { word: 'عنيف', translation: 'Violent / Fierce / Severe', root: 'ع ن ف', type: 'adjective' },
  { word: 'عنيفة', translation: 'Violent (fem.)', root: 'ع ن ف', type: 'adjective' },
  { word: 'عنفوان', translation: 'Prime of life / Vigour / Bloom', root: 'ع ن ف', type: 'noun' },
  { word: 'اعنف', translation: 'More violent / Fiercer', root: 'ع ن ف', type: 'adjective' },
  { word: 'يعنف', translation: 'Rebukes / Uses violence', root: 'ع ن ف', type: 'verb' },
  { word: 'فنع', translation: 'Flourished / Grew / Wealth / Abundance', root: 'ف ن ع', type: 'verb' },
  { word: 'نفع', translation: 'Benefit / Advantage / Profit', root: 'ن ف ع', type: 'noun' },
  { word: 'نافع', translation: 'Beneficial / Useful', root: 'ن ف ع', type: 'adjective' },
  { word: 'منفعة', translation: 'Benefit / Utility', root: 'ن ف ع', type: 'noun' },
  { word: 'منافع', translation: 'Benefits / Utilities', root: 'ن ف ع', type: 'noun' },
  { word: 'عفن', translation: 'Rot / Mold / Decay', root: 'ع ف ن', type: 'noun' },
  { word: 'عفونة', translation: 'Putrefaction / Moldiness', root: 'ع ف ن', type: 'noun' },
  { word: 'عفا', translation: 'Forgave / Pardoned / Effaced', root: 'ع ف و', type: 'verb' },
  { word: 'عفو', translation: 'Pardon / Forgiveness / Amnesty', root: 'ع ف و', type: 'noun' },
  { word: 'عفة', translation: 'Chastity / Purity / Modesty', root: 'ع ف ف', type: 'noun' },
  { word: 'فيل', translation: 'Elephant / Chess bishop / Bulky', root: 'ف ي ل', type: 'noun' },
  { word: 'بال', translation: 'Mind / Thought / State / Attention / Worn out', root: 'ب و ل', type: 'noun' },
  { word: 'عنب', translation: 'Grapes', root: 'ع ن ب', type: 'noun' },
  { word: 'ليف', translation: 'Fiber / Palm fibers / Loofah', root: 'ل ي ف', type: 'noun' },
  { word: 'لاب', translation: 'Turned around / Thirsty / Lab', root: 'ل و ب', type: 'verb' },
  { word: 'بان', translation: 'Appeared / Manifest / Moringa tree', root: 'ب ي ن', type: 'verb' },
  { word: 'بين', translation: 'Between / Distinct / Evident', root: 'ب ي ن', type: 'noun' },
  { word: 'ناب', translation: 'Canine tooth / Fangs / Deputized / Struck', root: 'ن و ب', type: 'noun' },
  { word: 'نال', translation: 'Attained / Acquired / Received', root: 'ن ي ل', type: 'verb' },
  { word: 'نيل', translation: 'Nile river / Attainment', root: 'ن ي ل', type: 'noun' },
  { word: 'فال', translation: 'Good omen / Portent / Tasted', root: 'ف ا ل', type: 'noun' },
  { word: 'فول', translation: 'Fava beans', root: 'ف و ل', type: 'noun' },
  { word: 'فاه', translation: 'Mouth / Spoke', root: 'ف و ه', type: 'verb' },
  { word: 'فاز', translation: 'Won / Triumphed', root: 'ف و ز', type: 'verb' },
  { word: 'فوز', translation: 'Victory / Triumph', root: 'ف و ز', type: 'noun' },
  { word: 'فار', translation: 'Mouse / Boiled over', root: 'ف و ر', type: 'noun' },
  { word: 'فور', translation: 'Instantly / Boiling', root: 'ف و ر', type: 'noun' },
  { word: 'فاح', translation: 'Emitted fragrance', root: 'ف و ح', type: 'verb' },
  { word: 'فوت', translation: 'Missed opportunity / Distance', root: 'ف و ت', type: 'noun' },
  { word: 'فات', translation: 'Passed / Elapsed / Missed', root: 'ف و ت', type: 'verb' },
  { word: 'فاض', translation: 'Overflowed / Abounded', root: 'ف ي ض', type: 'verb' },
  { word: 'فيض', translation: 'Flood / Abundance', root: 'ف ي ض', type: 'noun' },
  { word: 'فاد', translation: 'Benefited', root: 'ف ي د', type: 'verb' },
  { word: 'فهم', translation: 'Understood / Comprehension', root: 'ف ه م', type: 'verb' },
  { word: 'فهد', translation: 'Cheetah / Leopard', root: 'ف ه د', type: 'noun' },
  { word: 'فكر', translation: 'Thought / Reflect', root: 'ف ك ر', type: 'noun' },
  { word: 'فصل', translation: 'Season / Chapter / Separated', root: 'ف ص ل', type: 'noun' },
  { word: 'فرح', translation: 'Joy / Happiness / Glad', root: 'ف ر ح', type: 'noun' },
  { word: 'فتح', translation: 'Opened / Conquest / Victory', root: 'ف ت ح', type: 'verb' },
  { word: 'فعل', translation: 'Did / Verb / Action', root: 'ف ع ل', type: 'noun' },
  { word: 'فرق', translation: 'Difference / Separated / Group', root: 'ف ر ق', type: 'verb' },
  { word: 'فرع', translation: 'Branch / Offshoot', root: 'ف ر ع', type: 'noun' },
  { word: 'فرد', translation: 'Individual / Single', root: 'ف ر د', type: 'noun' },
  { word: 'فرس', translation: 'Mare / Horse / Persia', root: 'ف ر س', type: 'noun' },
  { word: 'فرش', translation: 'Spread / Furnishing', root: 'ف ر ش', type: 'verb' },
  { word: 'فرغ', translation: 'Emptied / Free time', root: 'ف ر غ', type: 'verb' },
  { word: 'فرط', translation: 'Excess / Wasted', root: 'ف ر ط', type: 'verb' },
  { word: 'فرك', translation: 'Rubbed / Massaged', root: 'ف ر ك', type: 'verb' },
  { word: 'فرن', translation: 'Oven / Furnace', root: 'ف ر ن', type: 'noun' },
  { word: 'فزع', translation: 'Panic / Rescued', root: 'ف ز ع', type: 'noun' },
  { word: 'فسد', translation: 'Spoiled / Corrupted', root: 'ف س د', type: 'verb' },
  { word: 'فسر', translation: 'Interpreted / Explained', root: 'ف س ر', type: 'verb' },
  { word: 'فصح', translation: 'Eloquent / Easter', root: 'ف ص ح', type: 'noun' },
  { word: 'فضح', translation: 'Exposed / Disgraced', root: 'ف ض ح', type: 'verb' },
  { word: 'فطر', translation: 'Broke fast / Nature / Mushroom', root: 'ف ط ر', type: 'noun' },
  { word: 'فطن', translation: 'Clever / Discerned', root: 'ف ط ن', type: 'adjective' },
  { word: 'فقد', translation: 'Lost / Bereaved', root: 'ف ق د', type: 'verb' },
  { word: 'فقر', translation: 'Poverty', root: 'ف ق ر', type: 'noun' },
  { word: 'فقه', translation: 'Jurisprudence / Understood', root: 'ف ق ه', type: 'noun' },
  { word: 'فلك', translation: 'Orbit / Celestial ship', root: 'ف ل ك', type: 'noun' },
  { word: 'فلح', translation: 'Succeeded / Cultivated', root: 'ف ل ح', type: 'verb' },
  { word: 'فلت', translation: 'Escaped', root: 'ف ل ت', type: 'verb' },
  { word: 'فلس', translation: 'Penny / Bankrupted', root: 'ف ل س', type: 'noun' },
  { word: 'فوج', translation: 'Group / Regiment', root: 'ف و ج', type: 'noun' },
  { word: 'فوق', translation: 'Above / Over', root: 'ف و ق', type: 'noun' },
  { word: 'فناء', translation: 'Courtyard / Extinction', root: 'ف ن ي', type: 'noun' },
  { word: 'فني', translation: 'Artistic / Technician / Perished', root: 'ف ن ن', type: 'adjective' },

  // Essential B words
  { word: 'باب', translation: 'Door / Chapter', root: 'ب و ب', type: 'noun' },
  { word: 'بات', translation: 'Spent the night / Became', root: 'ب ي ت', type: 'verb' },
  { word: 'بيت', translation: 'House / Home / Verse', root: 'ب ي ت', type: 'noun' },
  { word: 'باع', translation: 'Sold / Fathom', root: 'ب ي ع', type: 'verb' },
  { word: 'بيع', translation: 'Sale / Commerce', root: 'ب ي ع', type: 'noun' },
  { word: 'باد', translation: 'Perished / Desert', root: 'ب ي د', type: 'verb' },
  { word: 'بيد', translation: 'Desert / Whereas', root: 'ب ي د', type: 'noun' },
  { word: 'بار', translation: 'Righteous / Pious', root: 'ب ر ر', type: 'adjective' },
  { word: 'باس', translation: 'Might / Courage / Kissed', root: 'ب ا س', type: 'noun' },
  { word: 'باك', translation: 'Weeping / Crying', root: 'ب ك ي', type: 'adjective' },
  { word: 'باه', translation: 'Splendid / Boasted', root: 'ب ه و', type: 'adjective' },
  { word: 'بحث', translation: 'Researched / Searched', root: 'ب ح ث', type: 'verb' },
  { word: 'بحر', translation: 'Sea / Ocean', root: 'ب ح ر', type: 'noun' },
  { word: 'بخل', translation: 'Stinginess / Miserly', root: 'ب خ ل', type: 'noun' },
  { word: 'بخر', translation: 'Evaporated / Incense', root: 'ب خ ر', type: 'verb' },
  { word: 'بدأ', translation: 'Started / Began', root: 'ب د ا', type: 'verb' },
  { word: 'بدع', translation: 'Innovated / Marvelous', root: 'ب د ع', type: 'verb' },
  { word: 'بدل', translation: 'Substituted / Replaced', root: 'ب د ل', type: 'verb' },
  { word: 'بدن', translation: 'Body / Torso', root: 'ب د ن', type: 'noun' },
  { word: 'بدو', translation: 'Nomads / Bedouins', root: 'ب د و', type: 'noun' },
  { word: 'بذر', translation: 'Seed / Sowed', root: 'ب ذ ر', type: 'noun' },
  { word: 'بذل', translation: 'Exerted / Sacrificed', root: 'ب ذ ل', type: 'verb' },
  { word: 'برأ', translation: 'Innocent / Cured', root: 'ب ر ا', type: 'verb' },
  { word: 'برد', translation: 'Cold / Hail', root: 'ب ر د', type: 'noun' },
  { word: 'برز', translation: 'Emerged / Prominent', root: 'ب ر ز', type: 'verb' },
  { word: 'برق', translation: 'Lightning / Shimmered', root: 'ب ر ق', type: 'noun' },
  { word: 'برك', translation: 'Blessed / Knelt', root: 'ب ر ك', type: 'verb' },
  { word: 'برم', translation: 'Twisted / Ratified', root: 'ب ر م', type: 'verb' },
  { word: 'بسط', translation: 'Spread out / Simplified', root: 'ب س ط', type: 'verb' },
  { word: 'بصر', translation: 'Sight / Vision', root: 'ب ص ر', type: 'noun' },
  { word: 'بصل', translation: 'Onion', root: 'ب ص ل', type: 'noun' },
  { word: 'بضع', translation: 'Few / Several / Merchandised', root: 'ب ض ع', type: 'noun' },
  { word: 'بطأ', translation: 'Slowed down', root: 'ب ط ا', type: 'verb' },
  { word: 'بطء', translation: 'Slowness', root: 'ب ط ا', type: 'noun' },
  { word: 'بطح', translation: 'Laid flat', root: 'ب ط ح', type: 'verb' },
  { word: 'بطش', translation: 'Assault / Grip', root: 'ب ط ش', type: 'noun' },
  { word: 'بطل', translation: 'Hero / Champion / Nullified', root: 'ب ط ل', type: 'noun' },
  { word: 'بطن', translation: 'Belly / Inside', root: 'ب ط ن', type: 'noun' },
  { word: 'بعث', translation: 'Sent / Resurrected', root: 'ب ع ث', type: 'verb' },
  { word: 'بعد', translation: 'Distance / After / Far', root: 'ب ع د', type: 'noun' },
  { word: 'بعض', translation: 'Some / Part', root: 'ب ع ض', type: 'noun' },
  { word: 'بعل', translation: 'Husband / Baal', root: 'ب ع ل', type: 'noun' },
  { word: 'بغت', translation: 'Surprised / Caught off-guard', root: 'ب غ ت', type: 'verb' },
  { word: 'بغض', translation: 'Hatred / Loathing', root: 'ب غ ض', type: 'noun' },
  { word: 'بغل', translation: 'Mule', root: 'ب غ ل', type: 'noun' },
  { word: 'بقى', translation: 'Remained / Stayed', root: 'ب ق ي', type: 'verb' },
  { word: 'بقي', translation: 'Remained / Survived', root: 'ب ق ي', type: 'verb' },
  { word: 'بكر', translation: 'Early morning / First-born', root: 'ب ك ر', type: 'noun' },
  { word: 'بكى', translation: 'Wept / Cried', root: 'ب ك ي', type: 'verb' },
  { word: 'بلد', translation: 'Country / City / Town', root: 'ب ل د', type: 'noun' },
  { word: 'بلغ', translation: 'Reached / Attained', root: 'ب ل غ', type: 'verb' },
  { word: 'بلى', translation: 'Indeed / Affliction / Worn', root: 'ب ل ي', type: 'noun' },
  { word: 'بنت', translation: 'Girl / Daughter', root: 'ب ن ي', type: 'noun' },
  { word: 'بنى', translation: 'Built / Constructed', root: 'ب ن ي', type: 'verb' },
  { word: 'بني', translation: 'Brown / Sons of / Built', root: 'ب ن ي', type: 'noun' },
  { word: 'ابن', translation: 'Son', root: 'ب ن ي', type: 'noun' },
  { word: 'بند', translation: 'Clause / Banner / Article', root: 'ب ن د', type: 'noun' },
  { word: 'بنك', translation: 'Bank', root: 'ب ن ك', type: 'noun' },
  { word: 'بنج', translation: 'Anesthesia', root: 'ب ن ج', type: 'noun' },
  { word: 'بهت', translation: 'Amazed / Slandered', root: 'ب ه ت', type: 'verb' },
  { word: 'بهج', translation: 'Delighted / Cheerful', root: 'ب ه ج', type: 'verb' },
  { word: 'بهر', translation: 'Dazzled / Spices', root: 'ب ه ر', type: 'verb' },
  { word: 'بهم', translation: 'Mute / Cattle', root: 'ب ه م', type: 'noun' },
  { word: 'بوح', translation: 'Disclosure / Revealing', root: 'ب و ح', type: 'noun' },
  { word: 'بور', translation: 'Fallow land / Ruined', root: 'ب و ر', type: 'noun' },
  { word: 'بوق', translation: 'Horn / Trumpet', root: 'ب و ق', type: 'noun' },
  { word: 'بول', translation: 'Urine', root: 'ب و ل', type: 'noun' },
  { word: 'بيض', translation: 'Eggs / White', root: 'ب ي ض', type: 'noun' },

  // Essential Classical Words & Verbs
  { word: 'كتب', translation: 'Wrote / Books', root: 'ك ت ب', type: 'verb' },
  { word: 'قرأ', translation: 'Read / Recited', root: 'ق ر ا', type: 'verb' },
  { word: 'قرا', translation: 'Read / Recited', root: 'ق ر ا', type: 'verb' },
  { word: 'علم', translation: 'Knowledge / Flag / Science', root: 'ع ل م', type: 'noun' },
  { word: 'عمل', translation: 'Work / Action / Labor', root: 'ع م ل', type: 'noun' },
  { word: 'قلم', translation: 'Pen / Pencil', root: 'ق ل م', type: 'noun' },
  { word: 'دار', translation: 'Home / Abode / Turned', root: 'د و ر', type: 'noun' },
  { word: 'نور', translation: 'Light / Illumination', root: 'ن و ر', type: 'noun' },
  { word: 'نار', translation: 'Fire', root: 'ن و ر', type: 'noun' },
  { word: 'ماء', translation: 'Water', root: 'م و ه', type: 'noun' },
  { word: 'ارض', translation: 'Earth / Land / Ground', root: 'ا ر ض', type: 'noun' },
  { word: 'شمس', translation: 'Sun', root: 'ش م س', type: 'noun' },
  { word: 'قمر', translation: 'Moon', root: 'ق م ر', type: 'noun' },
  { word: 'نجم', translation: 'Star / Asterisk', root: 'ن ج م', type: 'noun' },
  { word: 'نهر', translation: 'River / Reproached', root: 'ن ه ر', type: 'noun' },
  { word: 'جبل', translation: 'Mountain', root: 'ج ب ل', type: 'noun' },
  { word: 'شجر', translation: 'Trees / Timber', root: 'ش ج ر', type: 'noun' },
  { word: 'ورد', translation: 'Roses / Arrived', root: 'و ر د', type: 'noun' },
  { word: 'زهر', translation: 'Flowers / Blossoms', root: 'ز ه ر', type: 'noun' },
  { word: 'طير', translation: 'Bird / Flying', root: 'ط ي ر', type: 'noun' },
  { word: 'سمك', translation: 'Fish', root: 'س م ك', type: 'noun' },
  { word: 'خيل', translation: 'Horses / Cavalry', root: 'خ ي ل', type: 'noun' },
  { word: 'اسد', translation: 'Lion', root: 'ا س د', type: 'noun' },
  { word: 'نمر', translation: 'Tiger / Leopard', root: 'ن م ر', type: 'noun' },
  { word: 'ذئب', translation: 'Wolf', root: 'ذ ا ب', type: 'noun' },
  { word: 'كلب', translation: 'Dog', root: 'ك ل ب', type: 'noun' },
  { word: 'قطة', translation: 'Cat', root: 'ق ط ط', type: 'noun' },
  { word: 'قط', translation: 'Cat / Never', root: 'ق ط ط', type: 'noun' },
  { word: 'جمل', translation: 'Camel / Beautified', root: 'ج م ل', type: 'noun' },
  { word: 'قلب', translation: 'Heart / Overturned', root: 'ق ل ب', type: 'noun' },
  { word: 'عقل', translation: 'Intellect / Mind / Tied', root: 'ع ق ل', type: 'noun' },
  { word: 'روح', translation: 'Soul / Spirit / Rest', root: 'ر و ح', type: 'noun' },
  { word: 'نفس', translation: 'Self / Soul / Breath', root: 'ن ف س', type: 'noun' },
  { word: 'عين', translation: 'Eye / Water Spring / Appointed', root: 'ع ي ن', type: 'noun' },
  { word: 'رأس', translation: 'Head / Leader / Cape', root: 'ر ا س', type: 'noun' },
  { word: 'راس', translation: 'Head / Leader', root: 'ر ا س', type: 'noun' },
  { word: 'أذن', translation: 'Ear / Permission', root: 'ا ذ ن', type: 'noun' },
  { word: 'اذن', translation: 'Ear / Therefore', root: 'ا ذ ن', type: 'noun' },
  { word: 'أنف', translation: 'Nose / Pride', root: 'ا ن ف', type: 'noun' },
  { word: 'انف', translation: 'Nose', root: 'ا ن ف', type: 'noun' },
  { word: 'رجل', translation: 'Man / Leg / Foot', root: 'ر ج ل', type: 'noun' },
  { word: 'صدر', translation: 'Chest / Originated', root: 'ص د ر', type: 'noun' },
  { word: 'ظهر', translation: 'Back / Noon / Appeared', root: 'ظ ه ر', type: 'noun' },
  { word: 'صوت', translation: 'Voice / Sound / Vote', root: 'ص و ت', type: 'noun' },
  { word: 'يوم', translation: 'Day', root: 'ي و م', type: 'noun' },
  { word: 'شهر', translation: 'Month / Famous', root: 'ش ه ر', type: 'noun' },
  { word: 'سنة', translation: 'Year / Sunnah / Slumber', root: 'س ن و', type: 'noun' },
  { word: 'عام', translation: 'Year / General / Floated', root: 'ع و م', type: 'noun' },
  { word: 'وقت', translation: 'Time / Moment', root: 'و ق ت', type: 'noun' },
  { word: 'زمن', translation: 'Era / Time', root: 'ز م ن', type: 'noun' },
  { word: 'سفر', translation: 'Travel / Journey / Scripture', root: 'س ف ر', type: 'noun' },
  { word: 'رحل', translation: 'Departed / Travelled / Saddle', root: 'ر ح ل', type: 'verb' },
  { word: 'رحلة', translation: 'Journey / Trip / Voyage', root: 'ر ح ل', type: 'noun' },
  { word: 'راحل', translation: 'Departing / Late person', root: 'ر ح ل', type: 'noun' },
  { word: 'رحيل', translation: 'Departure / Leaving', root: 'ر ح ل', type: 'noun' },
  { word: 'مرحلة', translation: 'Phase / Stage / Milestone', root: 'ر ح ل', type: 'noun' },
  { word: 'نزل', translation: 'Descended / Stayed / Lodged', root: 'ن ز ل', type: 'verb' },
  { word: 'منزل', translation: 'House / Home / Residence', root: 'ن ز ل', type: 'noun' },
  { word: 'نزول', translation: 'Descent / Landing', root: 'ن ز ل', type: 'noun' },
  { word: 'رجع', translation: 'Returned / Reverted', root: 'ر ج ع', type: 'verb' },
  { word: 'مرجع', translation: 'Reference / Authority', root: 'ر ج ع', type: 'noun' },
  { word: 'رجوع', translation: 'Return / Reversal', root: 'ر ج ع', type: 'noun' },
  { word: 'خرج', translation: 'Exited / Went out', root: 'خ ر ج', type: 'verb' },
  { word: 'مخرج', translation: 'Exit / Director / Outlet', root: 'خ ر ج', type: 'noun' },
  { word: 'خروج', translation: 'Exit / Departure', root: 'خ ر ج', type: 'noun' },
  { word: 'دخل', translation: 'Entered / Came in / Income', root: 'د خ ل', type: 'verb' },
  { word: 'مدخل', translation: 'Entrance / Introduction', root: 'د خ ل', type: 'noun' },
  { word: 'دخول', translation: 'Entry / Admission', root: 'د خ ل', type: 'noun' },
  { word: 'سار', translation: 'Walked / Marched', root: 'س ي ر', type: 'verb' },
  { word: 'سير', translation: 'Marching / Course / Walk', root: 'س ي ر', type: 'noun' },
  { word: 'مسار', translation: 'Path / Track / Course', root: 'س ي ر', type: 'noun' },
  { word: 'سيارة', translation: 'Car / Automobile', root: 'س ي ر', type: 'noun' },
  { word: 'سيرة', translation: 'Biography / Life journey', root: 'س ي ر', type: 'noun' },
  { word: 'قافلة', translation: 'Caravan', root: 'ق ف ل', type: 'noun' },
  { word: 'طاف', translation: 'Circumambulated / Roamed', root: 'ط و ف', type: 'verb' },
  { word: 'طواف', translation: 'Circumambulation / Tour', root: 'ط و ف', type: 'noun' },
  { word: 'زار', translation: 'Visited', root: 'ز و ر', type: 'verb' },
  { word: 'زيارة', translation: 'Visit', root: 'ز و ر', type: 'noun' },
  { word: 'زائر', translation: 'Visitor / Guest', root: 'ز و ر', type: 'noun' },
  { word: 'عاد', translation: 'Returned / Reverted', root: 'ع و د', type: 'verb' },
  { word: 'عودة', translation: 'Return', root: 'ع و د', type: 'noun' },
  { word: 'عيد', translation: 'Festival / Feast', root: 'ع و د', type: 'noun' },
  { word: 'حط', translation: 'Landed / Put down', root: 'ح ط ط', type: 'verb' },
  { word: 'محطة', translation: 'Station / Terminal', root: 'ح ط ط', type: 'noun' },
  { word: 'طرق', translation: 'Roads / Knocked', root: 'ط ر ق', type: 'verb' },
  { word: 'طريق', translation: 'Road / Path / Way', root: 'ط ر ق', type: 'noun' },
  { word: 'درب', translation: 'Trail / Path / Trained', root: 'د ر ب', type: 'noun' },
  { word: 'سوق', translation: 'Market / Drove', root: 'س و ق', type: 'noun' },
  { word: 'مال', translation: 'Money / Wealth / Inclined', root: 'م و ل', type: 'noun' },
  { word: 'ذهب', translation: 'Gold / Went / Departed', root: 'ذ ه ب', type: 'noun' },
  { word: 'فضة', translation: 'Silver', root: 'ف ض ض', type: 'noun' },
  { word: 'خبز', translation: 'Bread / Baked', root: 'خ ب ز', type: 'noun' },
  { word: 'لحم', translation: 'Meat / Joined', root: 'ل ح م', type: 'noun' },
  { word: 'لبن', translation: 'Milk / Yogurt', root: 'ل ب ن', type: 'noun' },
  { word: 'عسل', translation: 'Honey', root: 'ع س ل', type: 'noun' },
  { word: 'ملح', translation: 'Salt / Beautiful', root: 'م ل ح', type: 'noun' },
  { word: 'زيت', translation: 'Oil / Olive oil', root: 'ز ي ت', type: 'noun' },
  { word: 'تمر', translation: 'Dates fruit / Passed', root: 'ت م ر', type: 'noun' },
  { word: 'تين', translation: 'Figs', root: 'ت ي ن', type: 'noun' },
  { word: 'نخل', translation: 'Palm trees', root: 'ن خ ل', type: 'noun' },
  { word: 'زرع', translation: 'Crops / Planted', root: 'ز ر ع', type: 'noun' },
  { word: 'حرب', translation: 'War / Conflict', root: 'ح ر ب', type: 'noun' },
  { word: 'سلم', translation: 'Peace / Ladder / Safety', root: 'س ل م', type: 'noun' },
  { word: 'سلام', translation: 'Peace / Greeting', root: 'س ل م', type: 'noun' },
  { word: 'امن', translation: 'Safety / Security / Believed', root: 'ا م ن', type: 'noun' },
  { word: 'امان', translation: 'Security / Safety', root: 'ا م ن', type: 'noun' },
  { word: 'نصر', translation: 'Victory / Supported', root: 'ن ص ر', type: 'noun' },
  { word: 'سيف', translation: 'Sword', root: 'س ي ف', type: 'noun' },
  { word: 'رمح', translation: 'Spear', root: 'ر م ح', type: 'noun' },
  { word: 'قوس', translation: 'Bow / Arch / Bracket', root: 'ق و س', type: 'noun' },
  { word: 'درع', translation: 'Shield / Armor', root: 'د ر ع', type: 'noun' },
  { word: 'ملك', translation: 'King / Owned / Angel', root: 'م ل ك', type: 'noun' },
  { word: 'حكم', translation: 'Wisdom / Rule / Judged', root: 'ح ك م', type: 'noun' },
  { word: 'عدل', translation: 'Justice / Fairness', root: 'ع د ل', type: 'noun' },
  { word: 'ظلم', translation: 'Injustice / Darkness', root: 'ظ ل م', type: 'noun' },
  { word: 'صدق', translation: 'Truth / Honesty', root: 'ص د ق', type: 'noun' },
  { word: 'كذب', translation: 'Falsehood / Lies', root: 'ك ذ ب', type: 'noun' },
  { word: 'صبر', translation: 'Patience / Endurance', root: 'ص ب ر', type: 'noun' },
  { word: 'شكر', translation: 'Gratitude / Thanked', root: 'ش ك ر', type: 'noun' },
  { word: 'حمد', translation: 'Praise / Commended', root: 'ح م د', type: 'noun' },
  { word: 'فخر', translation: 'Pride / Honor', root: 'ف خ ر', type: 'noun' },
  { word: 'مجد', translation: 'Glory / Nobility', root: 'م ج د', type: 'noun' },
  { word: 'عز', translation: 'Might / Nobility', root: 'ع ز ز', type: 'noun' },
  { word: 'كرم', translation: 'Generosity / Vineyard', root: 'ك ر م', type: 'noun' },
  { word: 'جود', translation: 'Bounty / Generosity', root: 'ج و د', type: 'noun' },
  { word: 'خير', translation: 'Goodness / Best', root: 'خ ي ر', type: 'noun' },
  { word: 'شر', translation: 'Evil / Worst', root: 'ش ر ر', type: 'noun' },
  { word: 'نفع', translation: 'Benefit / Advantage', root: 'ن ف ع', type: 'noun' },
  { word: 'نجح', translation: 'Succeeded / Passed', root: 'ن ج ح', type: 'verb' },
  { word: 'حزن', translation: 'Grief / Sorrow', root: 'ح ز ن', type: 'noun' },
  { word: 'خوف', translation: 'Fear / Dread', root: 'خ و ف', type: 'noun' },
  { word: 'امل', translation: 'Hope', root: 'ا م ل', type: 'noun' },
  { word: 'ياس', translation: 'Despair', root: 'ي ا س', type: 'noun' },
  { word: 'عزم', translation: 'Determination / Resolved', root: 'ع ز م', type: 'noun' },
  { word: 'همة', translation: 'Ambition / Zeal', root: 'ه م م', type: 'noun' },
  { word: 'قوة', translation: 'Strength / Power', root: 'ق و ي', type: 'noun' },
  { word: 'ضعف', translation: 'Weakness / Doubled', root: 'ض ع ف', type: 'noun' },
  { word: 'كبر', translation: 'Grandeur / Grew old', root: 'ك ب ر', type: 'noun' },
  { word: 'صغر', translation: 'Smallness / Youth', root: 'ص غ ر', type: 'noun' },
  { word: 'طول', translation: 'Length / Height', root: 'ط و ل', type: 'noun' },
  { word: 'عرض', translation: 'Width / Display / Showed', root: 'ع ر ض', type: 'noun' },
  { word: 'عمق', translation: 'Depth', root: 'ع م ق', type: 'noun' },
  { word: 'قرب', translation: 'Nearness / Approached', root: 'ق ر ب', type: 'noun' },
  { word: 'تحت', translation: 'Under / Below', type: 'noun' },
  { word: 'خلف', translation: 'Behind / Successor', root: 'خ ل ف', type: 'noun' },
  { word: 'امام', translation: 'In front / Leader', root: 'ا م م', type: 'noun' },
  { word: 'يمين', translation: 'Right side / Oath', root: 'ي م ن', type: 'noun' },
  { word: 'يسار', translation: 'Left side / Ease / Wealth', root: 'ي س ر', type: 'noun' },
  { word: 'وسط', translation: 'Middle / Center', root: 'و س ط', type: 'noun' },
  { word: 'طرف', translation: 'Edge / Side / Blink', root: 'ط ر ف', type: 'noun' },
  { word: 'جمع', translation: 'Gathered / Plural / Friday', root: 'ج م ع', type: 'verb' },
  { word: 'وصل', translation: 'Connected / Arrived', root: 'و ص ل', type: 'verb' },
  { word: 'قطع', translation: 'Cut / Severed / Piece', root: 'ق ط ع', type: 'verb' },
  { word: 'اخذ', translation: 'Took / Received', root: 'ا خ ذ', type: 'verb' },
  { word: 'عطا', translation: 'Gift / Bestowed', root: 'ع ط و', type: 'noun' },
  { word: 'وهب', translation: 'Granted / Bestowed', root: 'و ه ب', type: 'verb' },
  { word: 'منع', translation: 'Prevented / Forbade', root: 'م ن ع', type: 'verb' },
  { word: 'سمع', translation: 'Heard / Hearing', root: 'س م ع', type: 'verb' },
  { word: 'نطق', translation: 'Spoke / Pronounced', root: 'ن ط ق', type: 'verb' },
  { word: 'صمت', translation: 'Silence', root: 'ص م ت', type: 'noun' },
  { word: 'مشى', translation: 'Walked / Strolled', root: 'م ش ي', type: 'verb' },
  { word: 'جرى', translation: 'Ran / Occurred / Flowed', root: 'ج ر ي', type: 'verb' },
  { word: 'وقف', translation: 'Stood / Stopped / Endowment', root: 'و ق ف', type: 'verb' },
  { word: 'جلس', translation: 'Sat down', root: 'ج ل س', type: 'verb' },
  { word: 'قام', translation: 'Stood up / Performed', root: 'ق و م', type: 'verb' },
  { word: 'نام', translation: 'Slept', root: 'ن و م', type: 'verb' },
  { word: 'صحا', translation: 'Woke up / Cleared', root: 'ص ح و', type: 'verb' },
  { word: 'اكل', translation: 'Ate / Food', root: 'ا ك ل', type: 'verb' },
  { word: 'شرب', translation: 'Drank / Beverage', root: 'ش ر ب', type: 'verb' },
  { word: 'لبس', translation: 'Wore / Dressed', root: 'ل ب س', type: 'verb' },
  { word: 'خلع', translation: 'Took off / Deposed', root: 'خ ل ع', type: 'verb' },
  { word: 'هدم', translation: 'Demolished / Razed', root: 'ه د م', type: 'verb' },
  { word: 'غرس', translation: 'Planted / Sapling', root: 'غ ر س', type: 'verb' },
  { word: 'حصد', translation: 'Harvested / Reaped', root: 'ح ص د', type: 'verb' },
  { word: 'ولد', translation: 'Child / Born / Boy', root: 'و ل د', type: 'noun' },
  { word: 'اخت', translation: 'Sister', root: 'ا خ و', type: 'noun' },
  { word: 'جد', translation: 'Grandfather / Serious', root: 'ج د د', type: 'noun' },
  { word: 'جدة', translation: 'Grandmother / City of Jeddah', root: 'ج د د', type: 'noun' },
  { word: 'خال', translation: 'Maternal uncle / Mole / Free', root: 'خ و ل', type: 'noun' },
  { word: 'عمة', translation: 'Paternal aunt', root: 'ع م م', type: 'noun' },
  { word: 'خالة', translation: 'Maternal aunt', root: 'خ و ل', type: 'noun' },
  { word: 'صاحب', translation: 'Companion / Friend / Owner', root: 'ص ح ب', type: 'noun' },
  { word: 'صديق', translation: 'Sincere friend / Truthful', root: 'ص د ق', type: 'noun' },
  { word: 'رفيق', translation: 'Companion / Gentle', root: 'ر ف ق', type: 'noun' },
  { word: 'جار', translation: 'Neighbor / Flowed', root: 'ج و ر', type: 'noun' },
  { word: 'ضيف', translation: 'Guest', root: 'ض ي ف', type: 'noun' },
  { word: 'عدو', translation: 'Enemy / Foe', root: 'ع د و', type: 'noun' },
  { word: 'خصم', translation: 'Opponent / Discount', root: 'خ ص م', type: 'noun' },
  { word: 'شيخ', translation: 'Elder / Sheikh', root: 'ش ي خ', type: 'noun' },
  { word: 'شاب', translation: 'Young man / Grayed', root: 'ش ب ب', type: 'noun' },
  { word: 'طفل', translation: 'Child / Infant', root: 'ط ف ل', type: 'noun' },
  { word: 'كهل', translation: 'Middle-aged person', root: 'ك ه ل', type: 'noun' },

  // Plurals, Derivations & 4+ Letter Words
  { word: 'كتاب', translation: 'Book', root: 'ك ت ب', type: 'noun' },
  { word: 'كاتب', translation: 'Writer / Author', root: 'ك ت ب', type: 'noun' },
  { word: 'مكتب', translation: 'Desk / Office', root: 'ك ت ب', type: 'noun' },
  { word: 'مكتوب', translation: 'Letter / Destiny / Written', root: 'ك ت ب', type: 'noun' },
  { word: 'قراءة', translation: 'Reading / Recitation', root: 'ق ر ا', type: 'noun' },
  { word: 'قارئ', translation: 'Reader / Reciter', root: 'ق ر ا', type: 'noun' },
  { word: 'عالم', translation: 'World / Universe / Scholar', root: 'ع ل م', type: 'noun' },
  { word: 'معلم', translation: 'Teacher / Instructor / Landmark', root: 'ع ل م', type: 'noun' },
  { word: 'تعليم', translation: 'Education / Teaching', root: 'ع ل م', type: 'noun' },
  { word: 'علامة', translation: 'Sign / Mark / Grade', root: 'ع ل م', type: 'noun' },
  { word: 'عامل', translation: 'Worker / Factor', root: 'ع م ل', type: 'noun' },
  { word: 'معمل', translation: 'Laboratory / Factory', root: 'ع م ل', type: 'noun' },
  { word: 'اعمال', translation: 'Deeds / Works / Businesses', root: 'ع م ل', type: 'noun' },
  { word: 'اقلام', translation: 'Pens / Pencils', root: 'ق ل م', type: 'noun' },
  { word: 'بيوت', translation: 'Houses / Homes', root: 'ب ي ت', type: 'noun' },
  { word: 'ابواب', translation: 'Doors / Chapters', root: 'ب و ب', type: 'noun' },
  { word: 'ديار', translation: 'Homes / Lands', root: 'د و ر', type: 'noun' },
  { word: 'انوار', translation: 'Lights', root: 'ن و ر', type: 'noun' },
  { word: 'نيران', translation: 'Fires', root: 'ن و ر', type: 'noun' },
  { word: 'مياه', translation: 'Waters', root: 'م و ه', type: 'noun' },
  { word: 'اراضي', translation: 'Lands / Grounds', root: 'ا ر ض', type: 'noun' },
  { word: 'شموس', translation: 'Suns', root: 'ش م س', type: 'noun' },
  { word: 'اقمار', translation: 'Moons / Satellites', root: 'ق م ر', type: 'noun' },
  { word: 'نجوم', translation: 'Stars', root: 'ن ج م', type: 'noun' },
  { word: 'بحار', translation: 'Seas / Sailor', root: 'ب ح ر', type: 'noun' },
  { word: 'انهار', translation: 'Rivers', root: 'ن ه ر', type: 'noun' },
  { word: 'جبال', translation: 'Mountains', root: 'ج ب ل', type: 'noun' },
  { word: 'اشجار', translation: 'Trees', root: 'ش ج ر', type: 'noun' },
  { word: 'ورود', translation: 'Roses / Arrivals', root: 'و ر د', type: 'noun' },
  { word: 'ازهار', translation: 'Flowers', root: 'ز ه ر', type: 'noun' },
  { word: 'طيور', translation: 'Birds', root: 'ط ي ر', type: 'noun' },
  { word: 'اسماك', translation: 'Fishes', root: 'س م ك', type: 'noun' },
  { word: 'خيول', translation: 'Horses', root: 'خ ي ل', type: 'noun' },
  { word: 'اسود', translation: 'Lions / Black', root: 'ا س د', type: 'noun' },
  { word: 'فهود', translation: 'Cheetahs', root: 'ف ه د', type: 'noun' },
  { word: 'نمور', translation: 'Tigers / Leopards', root: 'ن م ر', type: 'noun' },
  { word: 'ذئاب', translation: 'Wolves', root: 'ذ ا ب', type: 'noun' },
  { word: 'كلاب', translation: 'Dogs', root: 'ك ل ب', type: 'noun' },
  { word: 'قطط', translation: 'Cats', root: 'ق ط ط', type: 'noun' },
  { word: 'جمال', translation: 'Beauty / Camels', root: 'ج م ل', type: 'noun' },
  { word: 'قلوب', translation: 'Hearts', root: 'ق ل ب', type: 'noun' },
  { word: 'عقول', translation: 'Minds / Intellects', root: 'ع ق ل', type: 'noun' },
  { word: 'ارواح', translation: 'Souls / Spirits', root: 'ر و ح', type: 'noun' },
  { word: 'نفوس', translation: 'Souls / Selves', root: 'ن ف س', type: 'noun' },
  { word: 'عيون', translation: 'Eyes / Springs', root: 'ع ي ن', type: 'noun' },
  { word: 'رؤوس', translation: 'Heads', root: 'ر ا س', type: 'noun' },
  { word: 'اذان', translation: 'Ears / Call to prayer', root: 'ا ذ ن', type: 'noun' },
  { word: 'انوف', translation: 'Noses', root: 'ا ن ف', type: 'noun' },
  { word: 'رجال', translation: 'Men', root: 'ر ج ل', type: 'noun' },
  { word: 'صدور', translation: 'Chests / Forefronts', root: 'ص د ر', type: 'noun' },
  { word: 'ظهور', translation: 'Backs / Emergence', root: 'ظ ه ر', type: 'noun' },
  { word: 'بطون', translation: 'Bellies / Insides', root: 'ب ط ن', type: 'noun' },
  { word: 'اصوات', translation: 'Voices / Sounds', root: 'ص و ت', type: 'noun' },
  { word: 'ايام', translation: 'Days', root: 'ي و م', type: 'noun' },
  { word: 'ليال', translation: 'Nights', root: 'ل ي ل', type: 'noun' },
  { word: 'ليالي', translation: 'Nights', root: 'ل ي ل', type: 'noun' },
  { word: 'صباح', translation: 'Morning', root: 'ص ب ح', type: 'noun' },
  { word: 'مساء', translation: 'Evening', root: 'م س و', type: 'noun' },
  { word: 'شهور', translation: 'Months', root: 'ش ه ر', type: 'noun' },
  { word: 'اوقات', translation: 'Times / Moments', root: 'و ق ت', type: 'noun' },
  { word: 'ازمنة', translation: 'Eras / Times', root: 'ز م ن', type: 'noun' },
  { word: 'اسفار', translation: 'Journeys / Scriptures', root: 'س ف ر', type: 'noun' },
  { word: 'دروب', translation: 'Trails / Paths', root: 'د ر ب', type: 'noun' },
  { word: 'اسواق', translation: 'Markets', root: 'س و ق', type: 'noun' },
  { word: 'اموال', translation: 'Wealth / Funds', root: 'م و ل', type: 'noun' },
  { word: 'ارباح', translation: 'Profits / Gains', root: 'ر ب ح', type: 'noun' },
  { word: 'تجارة', translation: 'Commerce / Trade', root: 'ت ج ر', type: 'noun' },
  { word: 'تاجر', translation: 'Merchant / Trader', root: 'ت ج ر', type: 'noun' },
  { word: 'دكان', translation: 'Shop / Store', root: 'د ك ن', type: 'noun' },
  { word: 'بضاعة', translation: 'Goods / Merchandise', root: 'ب ض ع', type: 'noun' },
  { word: 'بضائع', translation: 'Goods / Commodities', root: 'ب ض ع', type: 'noun' },
  { word: 'شراء', translation: 'Purchasing / Buying', root: 'ش ر ي', type: 'noun' },
  { word: 'مبيع', translation: 'Sold item / Sale', root: 'ب ي ع', type: 'noun' },
  { word: 'مبيعات', translation: 'Sales', root: 'ب ي ع', type: 'noun' },
  { word: 'سعر', translation: 'Price / Rate', root: 'س ع ر', type: 'noun' },
  { word: 'اسعار', translation: 'Prices', root: 'س ع ر', type: 'noun' },
  { word: 'ايمان', translation: 'Faith / Belief', root: 'ا م ن', type: 'noun' },
  { word: 'مؤمن', translation: 'Believer', root: 'ا م ن', type: 'noun' },
  { word: 'مسلم', translation: 'Muslim / Submissive', root: 'س ل م', type: 'noun' },
  { word: 'اسلام', translation: 'Islam / Peace', root: 'س ل م', type: 'noun' },
  { word: 'انصار', translation: 'Helpers / Supporters', root: 'ن ص ر', type: 'noun' },
  { word: 'فتوح', translation: 'Conquests / Openings', root: 'ف ت ح', type: 'noun' },
  { word: 'مفتاح', translation: 'Key', root: 'ف ت ح', type: 'noun' },
  { word: 'سيوف', translation: 'Swords', root: 'س ي ف', type: 'noun' },
  { word: 'رماح', translation: 'Spears', root: 'ر م ح', type: 'noun' },
  { word: 'اقواس', translation: 'Bows / Brackets', root: 'ق و س', type: 'noun' },
  { word: 'دروع', translation: 'Shields', root: 'د ر ع', type: 'noun' },
  { word: 'ملوك', translation: 'Kings', root: 'م ل ك', type: 'noun' },
  { word: 'مملكة', translation: 'Kingdom', root: 'م ل ك', type: 'noun' },
  { word: 'حكام', translation: 'Rulers / Judges', root: 'ح ك م', type: 'noun' },
  { word: 'حكمة', translation: 'Wisdom', root: 'ح ك م', type: 'noun' },
  { word: 'محكمة', translation: 'Court of law', root: 'ح ك م', type: 'noun' },
  { word: 'عدالة', translation: 'Justice / Fairness', root: 'ع د ل', type: 'noun' },
  { word: 'صادق', translation: 'Truthful / Honest', root: 'ص د ق', type: 'adjective' },
  { word: 'كاذب', translation: 'Liar / Untrue', root: 'ك ذ ب', type: 'adjective' },
  { word: 'صبور', translation: 'Patient / Enduring', root: 'ص ب ر', type: 'adjective' },
  { word: 'شكور', translation: 'Grateful / Thankful', root: 'ش ك ر', type: 'adjective' },
  { word: 'حامد', translation: 'Praising', root: 'ح م د', type: 'adjective' },
  { word: 'محمود', translation: 'Praised / Commendable', root: 'ح م د', type: 'adjective' },
  { word: 'احمد', translation: 'Most praised / Ahmad', root: 'ح م د', type: 'noun' },
  { word: 'محمد', translation: 'Praised / Muhammad', root: 'ح م د', type: 'noun' },
  { word: 'كريم', translation: 'Generous / Noble', root: 'ك ر م', type: 'adjective' },
  { word: 'كرامة', translation: 'Dignity / Honor', root: 'ك ر م', type: 'noun' },
  { word: 'عزيز', translation: 'Mighty / Dear / Precious', root: 'ع ز ز', type: 'adjective' },
  { word: 'عزة', translation: 'Might / Honor', root: 'ع ز ز', type: 'noun' },
  { word: 'شريف', translation: 'Noble / Honorable', root: 'ش ر ف', type: 'adjective' },
  { word: 'شرف', translation: 'Honor / Nobility', root: 'ش ر ف', type: 'noun' },
  { word: 'فاضل', translation: 'Virtuous / Distinguished', root: 'ف ض ل', type: 'adjective' },
  { word: 'فضل', translation: 'Merit / Grace / Favor', root: 'ف ض ل', type: 'noun' },
  { word: 'فضيلة', translation: 'Virtue / Excellence', root: 'ف ض ل', type: 'noun' },
  { word: 'حسن', translation: 'Good / Beautiful / Hassan', root: 'ح س ن', type: 'adjective' },
  { word: 'احسان', translation: 'Benevolence / Excellence', root: 'ح س ن', type: 'noun' },
  { word: 'محسن', translation: 'Charitable / Benefactor', root: 'ح س ن', type: 'noun' },
  { word: 'حسنة', translation: 'Good deed / Merit', root: 'ح س ن', type: 'noun' },
  { word: 'جميل', translation: 'Beautiful / Handsome / Favor', root: 'ج م ل', type: 'adjective' },
  { word: 'لطيف', translation: 'Gentle / Kind / Subtle', root: 'ل ط ف', type: 'adjective' },
  { word: 'لطف', translation: 'Kindness / Courtesy', root: 'ل ط ف', type: 'noun' },
  { word: 'رحيم', translation: 'Merciful / Compassionate', root: 'ر ح م', type: 'adjective' },
  { word: 'رحمة', translation: 'Mercy / Compassion', root: 'ر ح م', type: 'noun' },
  { word: 'رحمن', translation: 'All-Merciful', root: 'ر ح م', type: 'noun' },
  { word: 'ودود', translation: 'Loving / Affectionate', root: 'و د د', type: 'adjective' },
  { word: 'حبيب', translation: 'Beloved / Sweetheart', root: 'ح ب ب', type: 'noun' },
  { word: 'محبوب', translation: 'Popular / Loved', root: 'ح ب ب', type: 'adjective' },
  { word: 'صديقة', translation: 'Female friend / Sincere', root: 'ص د ق', type: 'noun' },
  { word: 'اصدقاء', translation: 'Friends', root: 'ص د ق', type: 'noun' },
  { word: 'رفقاء', translation: 'Companions', root: 'ر ف ق', type: 'noun' },
  { word: 'جيران', translation: 'Neighbors', root: 'ج و ر', type: 'noun' },
  { word: 'ضيوف', translation: 'Guests', root: 'ض ي ف', type: 'noun' },
  { word: 'اعداء', translation: 'Enemies', root: 'ع د و', type: 'noun' },
  { word: 'خصوم', translation: 'Adversaries', root: 'خ ص م', type: 'noun' },
  { word: 'اولاد', translation: 'Children / Boys', root: 'و ل د', type: 'noun' },
  { word: 'بنات', translation: 'Girls / Daughters', root: 'ب ن ي', type: 'noun' },
  { word: 'ابناء', translation: 'Sons / Children', root: 'ب ن ي', type: 'noun' },
  { word: 'اخوة', translation: 'Brothers / Siblings', root: 'ا خ و', type: 'noun' },
  { word: 'اخوات', translation: 'Sisters', root: 'ا خ و', type: 'noun' },
  { word: 'اجداد', translation: 'Grandfathers / Ancestors', root: 'ج د د', type: 'noun' },
  { word: 'جدات', translation: 'Grandmothers', root: 'ج د د', type: 'noun' },
  { word: 'اخوال', translation: 'Maternal uncles', root: 'خ و ل', type: 'noun' },
  { word: 'اعمام', translation: 'Paternal uncles', root: 'ع م م', type: 'noun' },
  { word: 'عائلة', translation: 'Family / Household', root: 'ع ي ل', type: 'noun' },
  { word: 'عائلات', translation: 'Families', root: 'ع ي ل', type: 'noun' },
  { word: 'اسرة', translation: 'Family', root: 'ا س ر', type: 'noun' },
  { word: 'قبيلة', translation: 'Tribe', root: 'ق ب ل', type: 'noun' },
  { word: 'قبائل', translation: 'Tribes', root: 'ق ب ل', type: 'noun' },
  { word: 'شعب', translation: 'People / Nation', root: 'ش ع ب', type: 'noun' },
  { word: 'شعوب', translation: 'Nations / Peoples', root: 'ش ع ب', type: 'noun' },
  { word: 'امة', translation: 'Nation / Community', root: 'ا م م', type: 'noun' },
  { word: 'امم', translation: 'Nations', root: 'ا م م', type: 'noun' },
  { word: 'وطن', translation: 'Homeland / Motherland', root: 'و ط ن', type: 'noun' },
  { word: 'اوطان', translation: 'Homelands', root: 'و ط ن', type: 'noun' },
  { word: 'بلاد', translation: 'Countries / Lands', root: 'ب ل د', type: 'noun' },
  { word: 'بلدة', translation: 'Town / Township', root: 'ب ل د', type: 'noun' },
  { word: 'مدينة', translation: 'City', root: 'م د ن', type: 'noun' },
  { word: 'مدن', translation: 'Cities', root: 'م د ن', type: 'noun' },
  { word: 'قرية', translation: 'Village', root: 'ق ر ي', type: 'noun' },
  { word: 'قرى', translation: 'Villages', root: 'ق ر ي', type: 'noun' },
  { word: 'شارع', translation: 'Street / Thoroughfare', root: 'ش ر ع', type: 'noun' },
  { word: 'شوارع', translation: 'Streets', root: 'ش ر ع', type: 'noun' },
  { word: 'ميدان', translation: 'Square / Arena / Field', root: 'م ي د', type: 'noun' },
  { word: 'ساحة', translation: 'Plaza / Courtyard', root: 'س و ح', type: 'noun' },
  { word: 'حديقة', translation: 'Garden / Park', root: 'ح د ق', type: 'noun' },
  { word: 'حدائق', translation: 'Gardens', root: 'ح د ق', type: 'noun' },
  { word: 'بستان', translation: 'Orchard / Grove', type: 'noun' },
  { word: 'مزرعة', translation: 'Farm / Ranch', root: 'ز ر ع', type: 'noun' },
  { word: 'مزارع', translation: 'Farmer / Farms', root: 'ز ر ع', type: 'noun' },
  { word: 'قصر', translation: 'Palace / Shortened', root: 'ق ص ر', type: 'noun' },
  { word: 'قصور', translation: 'Palaces', root: 'ق ص ر', type: 'noun' },
  { word: 'قلعة', translation: 'Fortress / Castle', root: 'ق ل ع', type: 'noun' },
  { word: 'قلاع', translation: 'Castles / Fortresses', root: 'ق ل ع', type: 'noun' },
  { word: 'برج', translation: 'Tower / Zodiac constellation', root: 'ب ر ج', type: 'noun' },
  { word: 'ابراج', translation: 'Towers', root: 'ب ر ج', type: 'noun' },
  { word: 'حصن', translation: 'Fortress / Stronghold', root: 'ح ص ن', type: 'noun' },
  { word: 'حصون', translation: 'Fortresses', root: 'ح ص ن', type: 'noun' },
  { word: 'سور', translation: 'Enclosing wall / Fence', root: 'س و ر', type: 'noun' },
  { word: 'اسوار', translation: 'Walls / Fences', root: 'س و ر', type: 'noun' },
  { word: 'جدار', translation: 'Wall', root: 'ج د ر', type: 'noun' },
  { word: 'جدران', translation: 'Walls', root: 'ج د ر', type: 'noun' },
  { word: 'سقف', translation: 'Ceiling / Roof', root: 'س ق ف', type: 'noun' },
  { word: 'سقوف', translation: 'Roofs / Ceilings', root: 'س ق ف', type: 'noun' },
  { word: 'غرفة', translation: 'Room / Chamber', root: 'غ ر ف', type: 'noun' },
  { word: 'غرف', translation: 'Rooms', root: 'غ ر ف', type: 'noun' },
  { word: 'نافذة', translation: 'Window', root: 'ن ف ذ', type: 'noun' },
  { word: 'نوافذ', translation: 'Windows', root: 'ن ف ذ', type: 'noun' },
  { word: 'شباك', translation: 'Window / Net', root: 'ش ب ك', type: 'noun' },
  { word: 'كرسي', translation: 'Chair / Seat / Throne', root: 'ك ر س', type: 'noun' },
  { word: 'طاولة', translation: 'Table', root: 'ط و ل', type: 'noun' },
  { word: 'ساعة', translation: 'Clock / Hour / Watch', root: 'س و ع', type: 'noun' },
  { word: 'ساعات', translation: 'Hours / Clocks', root: 'س و ع', type: 'noun' },
  { word: 'صورة', translation: 'Picture / Image / Form', root: 'ص و ر', type: 'noun' },
  { word: 'صور', translation: 'Pictures / Images', root: 'ص و ر', type: 'noun' },
  { word: 'لوحة', translation: 'Painting / Board', root: 'ل و ح', type: 'noun' },
  { word: 'لوحات', translation: 'Paintings / Panels', root: 'ل و ح', type: 'noun' },
  { word: 'دفتر', translation: 'Notebook / Ledger', type: 'noun' },
  { word: 'ورقة', translation: 'Sheet of paper / Leaf', root: 'و ر ق', type: 'noun' },
  { word: 'اوراق', translation: 'Papers / Leaves', root: 'و ر ق', type: 'noun' },
  { word: 'حقيبة', translation: 'Bag / Suitcase', root: 'ح ق ب', type: 'noun' },
  { word: 'حقائب', translation: 'Bags', root: 'ح ق ب', type: 'noun' },
  { word: 'صندوق', translation: 'Box / Chest / Fund', root: 'ص ن د ق', type: 'noun' },
  { word: 'قفل', translation: 'Lock / Padlock', root: 'ق ف ل', type: 'noun' },
  { word: 'تاج', translation: 'Crown', root: 'ت و ج', type: 'noun' },
  { word: 'تيجان', translation: 'Crowns', root: 'ت و ج', type: 'noun' },
  { word: 'ثوب', translation: 'Robe / Dress / Garment', root: 'ث و ب', type: 'noun' },
  { word: 'ثياب', translation: 'Clothes / Garments', root: 'ث و ب', type: 'noun' },
  { word: 'قميص', translation: 'Shirt', root: 'ق م ص', type: 'noun' },
  { word: 'حذاء', translation: 'Footwear / Shoes', root: 'ح ذ و', type: 'noun' },

  // Conjugated Verb Forms & Modern Standard Words
  { word: 'يقرأ', translation: 'He reads', root: 'ق ر ا', type: 'verb' },
  { word: 'يقرا', translation: 'He reads', root: 'ق ر ا', type: 'verb' },
  { word: 'تقرأ', translation: 'She reads / you read', root: 'ق ر ا', type: 'verb' },
  { word: 'يكتب', translation: 'He writes', root: 'ك ت ب', type: 'verb' },
  { word: 'تكتب', translation: 'She writes / you write', root: 'ك ت ب', type: 'verb' },
  { word: 'يعلم', translation: 'He knows / teaches', root: 'ع ل م', type: 'verb' },
  { word: 'تعلم', translation: 'Learned / Education', root: 'ع ل م', type: 'verb' },
  { word: 'يعمل', translation: 'He works', root: 'ع م ل', type: 'verb' },
  { word: 'تعمل', translation: 'She works', root: 'ع م ل', type: 'verb' },
  { word: 'يذهب', translation: 'He goes', root: 'ذ ه ب', type: 'verb' },
  { word: 'تذهب', translation: 'She goes', root: 'ذ ه ب', type: 'verb' },
  { word: 'يرجع', translation: 'He returns', root: 'ر ج ع', type: 'verb' },
  { word: 'ترجع', translation: 'She returns', root: 'ر ج ع', type: 'verb' },
  { word: 'يدخل', translation: 'He enters', root: 'د خ ل', type: 'verb' },
  { word: 'تدخل', translation: 'She enters / intervention', root: 'د خ ل', type: 'verb' },
  { word: 'يخرج', translation: 'He exits / graduates', root: 'خ ر ج', type: 'verb' },
  { word: 'تخرج', translation: 'She exits / graduation', root: 'خ ر ج', type: 'verb' },
  { word: 'يقف', translation: 'He stands / stops', root: 'و ق ف', type: 'verb' },
  { word: 'يجلس', translation: 'He sits', root: 'ج ل س', type: 'verb' },
  { word: 'يقوم', translation: 'He stands up / performs', root: 'ق و م', type: 'verb' },
  { word: 'ينام', translation: 'He sleeps', root: 'ن و م', type: 'verb' },
  { word: 'يأكل', translation: 'He eats', root: 'ا ك ل', type: 'verb' },
  { word: 'ياكل', translation: 'He eats', root: 'ا ك ل', type: 'verb' },
  { word: 'يشرب', translation: 'He drinks', root: 'ش ر ب', type: 'verb' },
  { word: 'يلعب', translation: 'He plays', root: 'ل ع ب', type: 'verb' },
  { word: 'تلعب', translation: 'She plays', root: 'ل ع ب', type: 'verb' },
  { word: 'يبني', translation: 'He builds', root: 'ب ن ي', type: 'verb' },
  { word: 'يفوز', translation: 'He wins', root: 'ف و ز', type: 'verb' },
  { word: 'ينجح', translation: 'He succeeds', root: 'ن ج ح', type: 'verb' },
  { word: 'يفتح', translation: 'He opens', root: 'ف ت ح', type: 'verb' },
  { word: 'يفهم', translation: 'He understands', root: 'ف ه م', type: 'verb' },
  { word: 'يفكر', translation: 'He thinks', root: 'ف ك ر', type: 'verb' },
  { word: 'يحب', translation: 'He loves', root: 'ح ب ب', type: 'verb' },
  { word: 'يقول', translation: 'He says', root: 'ق و ل', type: 'verb' },
  { word: 'يسمع', translation: 'He hears', root: 'س م ع', type: 'verb' },
  { word: 'يرى', translation: 'He sees', root: 'ر ا ي', type: 'verb' },
  { word: 'يسأل', translation: 'He asks', root: 'س ا ل', type: 'verb' },
  { word: 'يجيب', translation: 'He answers', root: 'ج و ب', type: 'verb' },
  { word: 'سماء', translation: 'Sky / Heaven', root: 'س م و', type: 'noun' },
  { word: 'مطر', translation: 'Rain', root: 'م ط ر', type: 'noun' },
  { word: 'ثلج', translation: 'Snow / Ice', root: 'ث ل ج', type: 'noun' },
  { word: 'ريح', translation: 'Wind / Scent', root: 'ر و ح', type: 'noun' },
  { word: 'رياح', translation: 'Winds', root: 'ر و ح', type: 'noun' },
  { word: 'برق', translation: 'Lightning', root: 'ب ر ق', type: 'noun' },
  { word: 'رعد', translation: 'Thunder', root: 'ر ع د', type: 'noun' },
  { word: 'حياة', translation: 'Life', root: 'ح ي ي', type: 'noun' },
  { word: 'موت', translation: 'Death', root: 'م و ت', type: 'noun' },
  { word: 'صحة', translation: 'Health / Correctness', root: 'ص ح ح', type: 'noun' },
  { word: 'طبيب', translation: 'Doctor / Physician', root: 'ط ب ب', type: 'noun' },
  { word: 'جيش', translation: 'Army', root: 'ج ي ش', type: 'noun' },
  { word: 'قائد', translation: 'Leader / Commander', root: 'ق و د', type: 'noun' },
  { word: 'رئيس', translation: 'President / Chief', root: 'ر ا س', type: 'noun' },
  { word: 'وزير', translation: 'Minister', root: 'و ز ر', type: 'noun' },
  { word: 'مدير', translation: 'Director / Manager', root: 'د و ر', type: 'noun' },
  { word: 'استاذ', translation: 'Professor / Teacher', type: 'noun' },
  { word: 'طالب', translation: 'Student / Seeker', root: 'ط ل ب', type: 'noun' },
  { word: 'مدرسة', translation: 'School', root: 'د ر س', type: 'noun' },
  { word: 'جامعة', translation: 'University / Mosque', root: 'ج م ع', type: 'noun' },
  { word: 'درس', translation: 'Lesson / Studied', root: 'د ر س', type: 'noun' },
  { word: 'دروس', translation: 'Lessons', root: 'د ر س', type: 'noun' },
  { word: 'سؤال', translation: 'Question', root: 'س ا ل', type: 'noun' },
  { word: 'جواب', translation: 'Answer / Response', root: 'ج و ب', type: 'noun' },
  { word: 'فكرة', translation: 'Idea / Thought', root: 'ف ك ر', type: 'noun' },
  { word: 'افكار', translation: 'Ideas / Thoughts', root: 'ف ك ر', type: 'noun' },
  { word: 'راي', translation: 'Opinion / View', root: 'ر ا ي', type: 'noun' },
  { word: 'اراء', translation: 'Opinions / Views', root: 'ر ا ي', type: 'noun' },
  { word: 'خطة', translation: 'Plan / Strategy', root: 'خ ط ط', type: 'noun' },
  { word: 'هدف', translation: 'Goal / Target', root: 'ه د ف', type: 'noun' },
  { word: 'اهداف', translation: 'Goals / Targets', root: 'ه د ف', type: 'noun' },
  { word: 'نتيجة', translation: 'Result / Outcome', root: 'ن ت ج', type: 'noun' },
  { word: 'نتائج', translation: 'Results', root: 'ن ت ج', type: 'noun' },
  { word: 'سبب', translation: 'Reason / Cause', root: 'س ب ب', type: 'noun' },
  { word: 'اسباب', translation: 'Reasons / Causes', root: 'س ب ب', type: 'noun' },
  { word: 'قانون', translation: 'Law / Statute', root: 'ق ن ن', type: 'noun' },
  { word: 'نظام', translation: 'System / Order', root: 'ن ظ م', type: 'noun' },
  { word: 'لعبة', translation: 'Game / Toy', root: 'ل ع ب', type: 'noun' },
  { word: 'العاب', translation: 'Games / Toys', root: 'ل ع ب', type: 'noun' },
  { word: 'لاعب', translation: 'Player / Athlete', root: 'ل ع ب', type: 'noun' },
  { word: 'فريق', translation: 'Team / Group', root: 'ف ر ق', type: 'noun' },
  { word: 'ملعب', translation: 'Stadium / Field / Court', root: 'ل ع ب', type: 'noun' },
  { word: 'كرة', translation: 'Ball / Sphere', root: 'ك ر و', type: 'noun' },
  { word: 'كلمة', translation: 'Word / Speech', root: 'ك ل م', type: 'noun' },
  { word: 'كلمات', translation: 'Words', root: 'ك ل م', type: 'noun' },
  { word: 'كلام', translation: 'Speech / Talk', root: 'ك ل م', type: 'noun' },
  { word: 'حرف', translation: 'Letter / Edge / Profession', root: 'ح ر ف', type: 'noun' },
  { word: 'حروف', translation: 'Letters', root: 'ح ر ف', type: 'noun' },
  { word: 'سطر', translation: 'Line of writing', root: 'س ط ر', type: 'noun' },
  { word: 'جملة', translation: 'Sentence / Total', root: 'ج م ل', type: 'noun' },
  { word: 'نص', translation: 'Text / Provision', root: 'ن ص ص', type: 'noun' },
  { word: 'نصوص', translation: 'Texts', root: 'ن ص ص', type: 'noun' },
  { word: 'معنى', translation: 'Meaning / Sense', root: 'ع ن ي', type: 'noun' },
  { word: 'معاني', translation: 'Meanings', root: 'ع ن ي', type: 'noun' },
  { word: 'لغة', translation: 'Language / Tongue', root: 'ل غ و', type: 'noun' },
  { word: 'عربي', translation: 'Arabic / Arab', root: 'ع ر ب', type: 'adjective' },
  { word: 'عربية', translation: 'Arabic / Arabic vehicle', root: 'ع ر ب', type: 'noun' },
  { word: 'صحيح', translation: 'Correct / Authentic / Healthy', root: 'ص ح ح', type: 'adjective' },
  { word: 'خطأ', translation: 'Mistake / Error / Wrong', root: 'خ ط ا', type: 'noun' },
  { word: 'خطا', translation: 'Mistake / Error', root: 'خ ط ا', type: 'noun' },
  { word: 'نقطة', translation: 'Point / Dot / Score', root: 'ن ق ط', type: 'noun' },
  { word: 'نقاط', translation: 'Points / Dots', root: 'ن ق ط', type: 'noun' },
  { word: 'لوح', translation: 'Board / Tablet', root: 'ل و ح', type: 'noun' },
  { word: 'رقعة', translation: 'Board / Patch', root: 'ر ق ع', type: 'noun' },
];

/**
 * Trie Node structure for high-speed word validation and lookup
 */
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
  entry?: ArabicWordEntry;
}

class ArabicDictionaryService {
  private root: TrieNode = new TrieNode();
  private wordMap: Map<string, ArabicWordEntry> = new Map();

  constructor() {
    this.buildDictionary();
  }

  private buildDictionary() {
    for (const item of ARABIC_WORD_LIST) {
      this.insert(item.word, item);
      const norm = normalizeArabic(item.word);
      if (norm !== item.word) {
        this.insert(norm, item);
      }
      if (norm.endsWith('ة')) {
        const withHaa = norm.slice(0, -1) + 'ه';
        this.insert(withHaa, item);
      } else if (norm.endsWith('ه')) {
        const withTaa = norm.slice(0, -1) + 'ة';
        this.insert(withTaa, item);
      }
    }
  }

  private insert(word: string, entry: ArabicWordEntry) {
    const norm = normalizeArabic(word);
    if (!norm) return;

    this.wordMap.set(norm, entry);

    let current = this.root;
    for (const char of norm) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
    current.entry = entry;
  }

  /**
   * Check if an Arabic string is a valid word
   */
  public isValidWord(word: string): boolean {
    const norm = normalizeArabic(word);
    if (norm.length < 2) return false;

    // Direct Map check
    if (this.wordMap.has(norm)) return true;

    // Check with variations (ة <-> ه)
    if (norm.endsWith('ة') && this.wordMap.has(norm.slice(0, -1) + 'ه')) return true;
    if (norm.endsWith('ه') && this.wordMap.has(norm.slice(0, -1) + 'ة')) return true;

    // Trie check
    let current = this.root;
    for (const char of norm) {
      if (!current.children.has(char)) {
        return false;
      }
      current = current.children.get(char)!;
    }
    return current.isEndOfWord;
  }

  /**
   * Look up definition/details of an Arabic word
   */
  public getDefinition(word: string): ArabicWordEntry | null {
    const norm = normalizeArabic(word);
    if (this.wordMap.has(norm)) {
      return this.wordMap.get(norm)!;
    }
    if (norm.endsWith('ة') && this.wordMap.has(norm.slice(0, -1) + 'ه')) {
      return this.wordMap.get(norm.slice(0, -1) + 'ه')!;
    }
    if (norm.endsWith('ه') && this.wordMap.has(norm.slice(0, -1) + 'ة')) {
      return this.wordMap.get(norm.slice(0, -1) + 'ة')!;
    }
    return null;
  }

  /**
   * Add a word entry dynamically to the dictionary
   */
  public addWord(entry: ArabicWordEntry): void {
    const norm = normalizeArabic(entry.word);
    this.wordMap.set(norm, entry);
    this.insert(norm, entry);
  }

  /**
   * Get direct Almaany dictionary search URL for a given word
   */
  public getAlmaanyUrl(word: string): string {
    return `https://www.almaany.com/ar/dict/ar-ar/${encodeURIComponent(word.trim())}/`;
  }

  /**
   * Live lookup against Almaany API backend service
   */
  public async checkWordLive(word: string): Promise<{
    isValid: boolean;
    word: string;
    entry?: ArabicWordEntry;
    definitionAr?: string;
    source?: string;
    almaanyUrl: string;
  }> {
    const clean = word.trim();
    const fallbackUrl = this.getAlmaanyUrl(clean);

    // 1. Check in-memory local dictionary first
    if (this.isValidWord(clean)) {
      const entry = this.getDefinition(clean) || {
        word: clean,
        translation: 'Authentic Arabic Word',
        root: clean,
      };
      return {
        isValid: true,
        word: clean,
        entry,
        almaanyUrl: fallbackUrl,
        source: 'local_lexicon',
      };
    }

    // 2. Fetch from backend Almaany / Linguistic checker API
    try {
      const response = await fetch(`/api/dictionary/check?word=${encodeURIComponent(clean)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.isValid) {
          const entry: ArabicWordEntry = {
            word: data.word || clean,
            translation: data.translation || 'Valid Arabic word',
            root: data.root,
            type: data.type || 'noun',
          };
          this.addWord(entry);

          return {
            isValid: true,
            word: clean,
            entry,
            definitionAr: data.definitionAr,
            source: data.source || 'almaany',
            almaanyUrl: data.almaanyUrl || fallbackUrl,
          };
        }
      }
    } catch (err) {
      console.warn('Live dictionary check error:', err);
    }

    return {
      isValid: false,
      word: clean,
      almaanyUrl: fallbackUrl,
    };
  }

  /**
   * Return all valid words that can be formed using a given set of available letters
   */
  public findFormableWords(letters: string[], fixedLetter?: { char: string; position?: number }): ArabicWordEntry[] {
    const results: ArabicWordEntry[] = [];
    const available = letters.map(l => normalizeArabic(l));
    if (fixedLetter) {
      available.push(normalizeArabic(fixedLetter.char));
    }

    for (const [normWord, entry] of this.wordMap.entries()) {
      if (fixedLetter && !normWord.includes(normalizeArabic(fixedLetter.char))) {
        continue;
      }
      if (this.canForm(normWord, available)) {
        results.push(entry);
      }
    }
    return results;
  }

  private canForm(word: string, availableLetters: string[]): boolean {
    const letterPool = [...availableLetters];
    for (const char of word) {
      const idx = letterPool.indexOf(char);
      if (idx === -1) {
        return false;
      }
      letterPool.splice(idx, 1);
    }
    return true;
  }

  public getRandomWords(count = 5): ArabicWordEntry[] {
    const all = Array.from(this.wordMap.values());
    const shuffled = [...all].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

export const arabicDictionary = new ArabicDictionaryService();
