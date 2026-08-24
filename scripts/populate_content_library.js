#!/usr/bin/env node
/**
 * Populate content_library.json with:
 *   - 5 fabric-based care instructions (shared across all 30 products)
 *   - 26 weave stories (12 existing + 14 new stubs)
 *   - 30 descriptions (12 existing + 18 new stubs)
 * Then update every product detail file + contentRefs in products_index.json.
 *
 * Run: node scripts/populate_content_library.js
 */

const fs   = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// ── Fabric → care instruction ID ────────────────────────────
const careMap = {
  'katan silk':    'CI-SILK',
  'pure silk':     'CI-SILK',
  'georgette silk':'CI-SILK',
  'khadi silk':    'CI-SILK',
  'muga silk':     'CI-SILK',
  'tussar silk':   'CI-TUSSAR',
  'silk cotton':   'CI-SILK-COTTON',
  'cotton silk':   'CI-SILK-COTTON',
  'linen silk':    'CI-SILK-COTTON',
  'fine cotton':   'CI-COTTON',
  'organic cotton':'CI-COTTON',
  'muslin cotton': 'CI-MUSLIN',
  'silk muslin':   'CI-MUSLIN',
};

// ── Weave type → weave story ID ─────────────────────────────
const wsMap = {
  'banarasi':'WS-002','kanjivaram':'WS-006','baluchari':'WS-001',
  'chanderi':'WS-003','sambalpuri':'WS-010','paithani':'WS-009',
  'tussar':'WS-012','ikat':'WS-004','maheshwari':'WS-007',
  'mysore':'WS-008','jamdani':'WS-005','tant':'WS-011',
  'nauvari':'WS-013','phulkari':'WS-014','gadwal':'WS-015',
  'kasavu':'WS-016','chettinad':'WS-017','kotpad':'WS-018',
  'bomkai':'WS-019','ilkal':'WS-020','patola':'WS-021',
  'bandhani':'WS-022','sungudi':'WS-023','khadi silk':'WS-024',
  'muga':'WS-025','linen':'WS-026',
};

// ── Product → description ID ─────────────────────────────────
const descMap = {
  'AMY-BAL-001':'DESC-001','AMY-BAN-001':'DESC-002','AMY-CHA-001':'DESC-003',
  'AMY-IKA-001':'DESC-004','AMY-JAM-001':'DESC-005','AMY-KAN-001':'DESC-006',
  'AMY-MAH-001':'DESC-007','AMY-MYS-001':'DESC-008','AMY-PAI-001':'DESC-009',
  'AMY-SAM-001':'DESC-010','AMY-TAN-001':'DESC-011','AMY-TUS-001':'DESC-012',
  'AMY-NAU-001':'DESC-013','AMY-PHU-001':'DESC-014','AMY-GAD-001':'DESC-015',
  'AMY-KAS-001':'DESC-016','AMY-BAN-002':'DESC-017','AMY-NAT-001':'DESC-018',
  'AMY-KOT-001':'DESC-019','AMY-DHA-001':'DESC-020','AMY-KAN-002':'DESC-021',
  'AMY-SUT-001':'DESC-022','AMY-BOM-001':'DESC-023','AMY-ILL-001':'DESC-024',
  'AMY-PAT-001':'DESC-025','AMY-RAJ-001':'DESC-026','AMY-TAN-002':'DESC-027',
  'AMY-MAD-001':'DESC-028','AMY-KHA-001':'DESC-029','AMY-MUG-001':'DESC-030',
};

// ════════════════════════════════════════════════════════════
// CONTENT LIBRARY DATA
// ════════════════════════════════════════════════════════════

const careSuggestions = [
  {
    id:'CI-SILK', key:'care_silk', label:'Pure & Fine Silk Sarees',
    text:'Dry clean only. Store wrapped in a soft muslin cloth in a cool, dark place — never in plastic. Keep away from direct sunlight and moisture, which can dull the zari and weaken silk threads. Iron on the lowest heat setting on the reverse side only, with a thin cotton cloth between the iron and the saree. Never spray water directly on silk.'
  },
  {
    id:'CI-TUSSAR', key:'care_tussar', label:'Tussar & Wild Silk Sarees',
    text:'Dry clean recommended. If hand washing, use a pH-neutral soap in cool water — do not soak for more than 2 minutes. Never wring or twist. Lift and press gently between clean towels to remove excess water. Dry flat in shade. The natural golden sheen of Tussar is best preserved with dry cleaning.'
  },
  {
    id:'CI-SILK-COTTON', key:'care_silk_cotton', label:'Silk-Cotton & Blended Sarees',
    text:'Gentle hand wash in cold water with mild detergent, or dry clean. The silk-cotton blend is more forgiving than pure silk — do not machine wash, as agitation can loosen the weave. Dry in shade and iron on medium heat. With each wash, the fabric develops a lovely lived-in softness.'
  },
  {
    id:'CI-COTTON', key:'care_cotton', label:'Handloom Cotton Sarees',
    text:'Hand wash in cold water with mild detergent, or gentle machine wash (cold, delicate cycle). Cotton sarees soften beautifully with each wash — this is a feature, not a flaw. Do not bleach. Dry in shade to prevent colour fading. Iron while slightly damp on medium heat. For embroidered variants (Phulkari), hand wash gently and dry flat.'
  },
  {
    id:'CI-MUSLIN', key:'care_muslin', label:'Muslin & Jamdani Sarees',
    text:'Dry clean only — muslin is among the most delicate weaves in the world. Never machine wash, soak, or wring. If hand washing is necessary, use cool water and the mildest possible soap; support the full weight of the wet saree when lifting. Store loosely folded in muslin cloth in a dry place. Never hang a wet muslin saree — it will stretch irreversibly.'
  },
];

const weaveStories = [
  { id:'WS-001', key:'ws_baluchari', label:'Baluchari Silk',
    text:'Baluchari weaving originated in Murshidabad and later found its home in Bishnupur, West Bengal. The tradition of depicting Puranic narratives in the pallu is unique to this weave and represents one of India\'s most distinctive textile art forms.' },
  { id:'WS-002', key:'ws_banarasi', label:'Banarasi',
    text:'Banarasi weaving is one of India\'s most celebrated textile traditions, with roots stretching back over 2,000 years to the ancient city of Varanasi. This saree was handwoven on a traditional pit loom by a master weaver from the Ansari community of Varanasi — a family that has practised this craft for seven generations.' },
  { id:'WS-003', key:'ws_chanderi', label:'Chanderi',
    text:'Chanderi has been a centre of fine textile weaving since the Vedic period. The town of Chanderi in Madhya Pradesh produces sarees that combine cotton warp with silk weft, creating a fabric that is simultaneously sturdy and sheer.' },
  { id:'WS-004', key:'ws_pochampally', label:'Pochampally Ikat',
    text:'Pochampally, a village near Hyderabad in Telangana, is the birthplace of Indian double Ikat silk. The Pochampally Ikat received GI protection in 2004 and is one of only a handful of double Ikat traditions in the world.' },
  { id:'WS-005', key:'ws_jamdani', label:'Jamdani',
    text:'Jamdani weaving originated in Dhaka (now Bangladesh) but has a thriving tradition in West Bengal, particularly around Fulia and Shantipur. The Jamdani tradition is inscribed on UNESCO\'s Intangible Cultural Heritage list.' },
  { id:'WS-006', key:'ws_kanjivaram', label:'Kanjivaram',
    text:'Kanjivaram sarees are woven with pure mulberry silk threads, with the body and border woven separately and then interlocked together. This ancient technique, unchanged for centuries, gives Kanjivaram sarees their distinctive weight and durability.' },
  { id:'WS-007', key:'ws_maheshwari', label:'Maheshwari',
    text:'Maheshwari weaving was revived in the 18th century by Queen Ahilya Bai Holkar of Indore, who established a weaving centre in Maheshwar and brought master weavers from across the country. The tradition continues today, supported by the Rehwa Society.' },
  { id:'WS-008', key:'ws_mysore', label:'Mysore Silk',
    text:'Mysore silk weaving has been under the patronage of the Mysore royal family since the 17th century. The Karnataka Silk Industries Corporation (KSIC) continues to produce authentic Mysore silk using traditional techniques and natural mulberry silk.' },
  { id:'WS-009', key:'ws_paithani', label:'Paithani',
    text:'Paithani weaving dates back over 2,000 years to the Satavahana dynasty. The town of Paithan on the banks of the Godavari river remains the heartland of this tradition. Each saree is woven using the interlocking weft technique — making the saree identical on both sides.' },
  { id:'WS-010', key:'ws_sambalpuri', label:'Sambalpuri Ikat',
    text:'Sambalpuri weaving has been practised in the Sambalpur district of Odisha for centuries. The Meher cooperative — a group of 12 weaver families — produces these sarees using the traditional Bandhakala technique passed down through generations.' },
  { id:'WS-011', key:'ws_tant', label:'Tant',
    text:'Tant weaving is the backbone of Bengal\'s handloom tradition, with thousands of weavers in the Nadia and Murshidabad districts producing these sarees for everyday wear. Despite being the most affordable handloom saree, every Tant is woven by hand.' },
  { id:'WS-012', key:'ws_tussar', label:'Bhagalpuri Tussar',
    text:'Bhagalpur in Bihar has been the centre of Tussar silk production for over a thousand years, earning it the name \'Silk City of India\'. Tussar silk is produced from the cocoons of wild Antheraea moths that feed on Arjun and Asan trees.' },
  { id:'WS-013', key:'ws_nauvari', label:'Nauvari',
    text:'The Nauvari — literally \'nine yards\' — is Maharashtra\'s traditional saree, draped uniquely in the Kashtha style without a petticoat. Also called Lugade, it is the ceremonial garment of Marathi weddings, festivals, and classical Lavani dance. The silk Nauvari is handwoven in Yeola and Paithani weaving centres across Maharashtra.' },
  { id:'WS-014', key:'ws_phulkari', label:'Phulkari',
    text:'Phulkari — \'flower work\' in Punjabi — is an ancient embroidery tradition passed down by women across Punjab and Haryana. Traditionally created for bridal trousseaus over many months, each piece uses vibrant silk floss on coarse cotton. The tradition was nearly lost and has been revived by weavers\' cooperatives.' },
  { id:'WS-015', key:'ws_gadwal', label:'Gadwal',
    text:'Gadwal weaving is a 300-year-old tradition from the Gadwal kingdom in Telangana. What defines a Gadwal saree is the juxtaposition of a cotton body with a pure silk and zari border — two different materials expertly woven together on the same loom using an interlocking technique unique to Gadwal.' },
  { id:'WS-016', key:'ws_kasavu', label:'Kasavu',
    text:'The Kerala Kasavu saree — also called Mundum Neriyathum — is Kerala\'s traditional garment, distinguished by its pristine off-white cotton body and gleaming gold kasavu border. Woven by the master weavers of Balaramapuram near Thiruvananthapuram, the Kasavu is worn at Onam, Vishu, and weddings across Kerala.' },
  { id:'WS-017', key:'ws_chettinad', label:'Chettinad',
    text:'Chettinad weaving is a 200-year-old tradition from Tamil Nadu, patronised by the prosperous Nattukotai Chettiar trading community. The bold check and stripe patterns woven on fly-shuttle looms are immediately recognisable — a celebration of geometry and craftsmanship from the heart of Tamil Nadu.' },
  { id:'WS-018', key:'ws_kotpad', label:'Kotpad',
    text:'Kotpad tribal weaving is practised by the Kostha weavers of Kotpad, Odisha. What makes Kotpad unique is its use of lac-based natural dyes in earthy terracotta, brown, and red — colours derived entirely from plants and insects found in the surrounding Bastar forests. Kotpad has a GI tag.' },
  { id:'WS-019', key:'ws_bomkai', label:'Bomkai',
    text:'Bomkai — also known as Sonepuri — is a Silk Mark certified handloom tradition from Ganjam district, Odisha. The sarees are distinguished by intricate tribal motifs (fish, conch, temple spires, birds) woven into the body and border using the supplementary weft technique.' },
  { id:'WS-020', key:'ws_ilkal', label:'Ilkal',
    text:'Ilkal is a handloom tradition from Ilkal town in Karnataka. The signature feature is the joining of the body and a contrasting silk pallu using the unique Koppada interlocking technique — a skill so specific that it has evolved in only one town on earth. The Tope Teni border and warm colour palette are hallmarks of this tradition.' },
  { id:'WS-021', key:'ws_patola', label:'Patan Patola',
    text:'Patan Patola is the rarest silk tradition in India — a true double Ikat where both warp and weft threads are resist-dyed with extraordinary precision before a single thread is woven. Only three families in Patan, Gujarat still practise this craft. A single Patola saree can take six months to a year and requires two weavers working in perfect synchrony.' },
  { id:'WS-022', key:'ws_bandhani', label:'Bandhani',
    text:'Bandhani — from the Sanskrit \'bandha\', to bind — is the ancient tie-dye tradition of Rajasthan and Gujarat. Tiny portions of fabric are hand-tied with thread before dyeing, creating patterns of intricate dots, waves, and flowers. The finest Bandhani involves tying thousands of knots smaller than a grain of rice on a single saree.' },
  { id:'WS-023', key:'ws_sungudi', label:'Sungudi',
    text:'Sungudi is a hand-tied tie-and-dye tradition unique to Madurai, Tamil Nadu, created by Saurashtra weavers who settled there centuries ago. The saree is tied in intricate patterns and dyed in multiple rounds to build up the distinctive dot-and-motif designs.' },
  { id:'WS-024', key:'ws_khadi_silk', label:'Assam Khadi Silk',
    text:'Assam Khadi is hand-spun and hand-woven silk, made by artisans across the Brahmaputra valley following Gandhi\'s vision of self-reliant village enterprise. Unlike industrial silk, Assam Khadi retains a natural texture and deliberate irregularity — the mark of a human hand behind every thread.' },
  { id:'WS-025', key:'ws_muga', label:'Muga Silk',
    text:'Muga silk is the golden silk of Assam — among the rarest natural fibres in the world, produced exclusively in the Brahmaputra valley. The Antheraea assamensis silkworm feeds on Som and Soalu trees, yielding a naturally golden thread that grows more lustrous with every wash. Muga silk is Silk Mark certified.' },
  { id:'WS-026', key:'ws_linen', label:'Bhagalpuri Linen Silk',
    text:'Bhagalpuri linen represents a contemporary evolution of Bhagalpur\'s centuries-old weaving tradition. The master weavers of Silk City — long celebrated for Tussar — have adapted their craft to blend linen\'s breathability with silk\'s lustre, creating a fabric modern yet deeply rooted in Bihar\'s handloom heritage.' },
];

const descriptions = [
  { id:'DESC-001', key:'desc_baluchari', label:'Baluchari Silk Saree',
    text:'The Baluchari saree is a living canvas of mythology. Woven by the Basak family of Bishnupur — master storyteller weavers — the pallu depicts scenes from the Ramayana and Mahabharata in intricate silk brocade. Each saree takes weeks to complete and is a true collector\'s piece.' },
  { id:'DESC-002', key:'desc_banarasi', label:'Katan Silk Banarasi Saree',
    text:'This exquisite Katan Silk Banarasi saree is a testament to the timeless craft of Varanasi\'s master weavers. Woven from the finest Katan silk — a tightly twisted, lustrous thread — this saree carries a weight and drape that is unmistakably regal. The deep red body is adorned with intricate Meenakari brocade in gold zari.' },
  { id:'DESC-003', key:'desc_chanderi', label:'Chanderi Cotton Silk Saree',
    text:'Chanderi sarees are celebrated for their sheer, gossamer-light texture and delicate lustre. This ivory cotton silk Chanderi is perfect for warm weather — breathable, elegant, and effortlessly graceful. The subtle gold bootis woven throughout add a quiet opulence to the fabric.' },
  { id:'DESC-004', key:'desc_pochampally', label:'Pochampally Double Ikat',
    text:'Pochampally Double Ikat is one of the most technically demanding weaves in the world — both warp and weft threads are resist-dyed before weaving, requiring extraordinary precision for the pattern to align. This teal and gold silk Ikat features traditional geometric patterns with a striking contemporary feel.' },
  { id:'DESC-005', key:'desc_jamdani', label:'Jamdani Muslin Saree',
    text:'Jamdani is one of the finest muslin weaves in the world — so sheer that historical accounts describe it as \'woven air\'. This white and gold Jamdani features traditional floral motifs woven directly into the fabric using the supplementary weft technique, creating a three-dimensional texture on an ethereally light base.' },
  { id:'DESC-006', key:'desc_kanjivaram', label:'Pure Kanjivaram Silk Saree',
    text:'A masterpiece of South Indian silk weaving, this Pure Kanjivaram saree features the iconic temple border and brilliant gold zari work. Woven by the Devanathan family of Kanchipuram — three generations of master weavers — this saree embodies the grandeur and heritage of Tamil Nadu\'s most celebrated textile tradition.' },
  { id:'DESC-007', key:'desc_maheshwari', label:'Maheshwari Silk Cotton',
    text:'Maheshwari sarees from the historic town of Maheshwar on the banks of the Narmada are known for their distinctive reversible quality and subtle shimmer. This pink and silver silk-cotton Maheshwari has the characteristic fine stripe and check pattern with a delicate silver border.' },
  { id:'DESC-008', key:'desc_mysore', label:'Mysore Pure Silk Saree',
    text:'Mysore silk is celebrated for its smooth, crepe-like texture and natural lustre. Lighter and more fluid than Kanjivaram, Mysore silk is ideal for both daily wear and festive occasions. This coral red saree features a classic gold zari border and a lustrous body that showcases the silk\'s natural beauty.' },
  { id:'DESC-009', key:'desc_paithani', label:'Paithani Pure Silk Saree',
    text:'The Paithani is the pride of Maharashtra — a saree of extraordinary richness woven in the ancient town of Paithan. This peacock green silk Paithani features the iconic peacock motif in the pallu, woven in vibrant zari. The interlocking tapestry weave makes every Paithani reversible and uniquely precious.' },
  { id:'DESC-010', key:'desc_sambalpuri', label:'Sambalpuri Ikat Silk',
    text:'The Sambalpuri Ikat is distinguished by its traditional Bandhakala technique — where threads are tie-dyed before weaving to create the pattern. The result is a saree with a distinctive blurred-edge motif impossible to replicate by machine. This red and black silk Ikat features traditional Shankha and Chakra motifs.' },
  { id:'DESC-011', key:'desc_tant', label:'Tant Cotton Saree',
    text:'The Tant is Bengal\'s everyday saree — lightweight, breathable, and beautifully simple. Woven from fine cotton on handlooms in Shantipur and Fulia, the Tant saree is perfect for warm weather and daily wear. This blue and white Tant features a classic woven check pattern.' },
  { id:'DESC-012', key:'desc_tussar', label:'Bhagalpuri Tussar Silk',
    text:'Bhagalpuri Tussar — also called \'wild silk\' — has a distinctive natural golden sheen and a slightly textured, matte surface that sets it apart from cultivated silk. This saree in warm gold and brown tones has a natural earthy elegance, with traditional Bhagalpuri motifs woven into the border.' },
  { id:'DESC-013', key:'desc_nauvari', label:'Nauvari Pure Silk Saree',
    text:'A celebration of Maharashtrian heritage, this Nauvari saree is woven in pure silk for the traditional nine-yard Kashtha drape. Rich in cultural identity, it is the ceremonial choice of Marathi brides and classical Lavani dancers — a saree that carries the soul of Maharashtra.' },
  { id:'DESC-014', key:'desc_phulkari', label:'Phulkari Embroidered Cotton',
    text:'Phulkari — \'flower work\' — is the embroidery tradition that has adorned bridal trousseaus across Punjab for centuries. This fine cotton saree is hand-embroidered with vivid floral motifs in silk floss, each stitch placed by hand with extraordinary care. A wearable piece of Punjab\'s living heritage.' },
  { id:'DESC-015', key:'desc_gadwal', label:'Gadwal Silk Cotton Saree',
    text:'The Gadwal saree is famous for one defining feature: a silk and zari border woven onto a cotton body on the same loom, using a unique interlocking technique. The result combines the comfort of cotton with the grandeur of silk — and the genius of Gadwal\'s 300-year-old weaving tradition.' },
  { id:'DESC-016', key:'desc_kasavu', label:'Kerala Kasavu Cotton Saree',
    text:'The Kerala Kasavu saree is the embodiment of understated elegance — a pristine off-white cotton body with a gleaming gold kasavu border. Woven by master weavers of Balaramapuram near Thiruvananthapuram, this saree is worn at Onam, Vishu, and weddings across Kerala.' },
  { id:'DESC-017', key:'desc_banarasi_georgette', label:'Banarasi Georgette Silk Saree',
    text:'A lighter, contemporary take on the classic Banarasi, this Georgette Silk saree brings Varanasi\'s signature zari craftsmanship to a flowing, fluid fabric. Perfect for those who love Banarasi artistry with the ease of georgette drape — festive without the weight.' },
  { id:'DESC-018', key:'desc_chettinad', label:'Chettinad Cotton Saree',
    text:'Chettinad cotton sarees are celebrated for their bold check and stripe patterns — a hallmark of the prosperous Nattukotai Chettiar community of Tamil Nadu. Woven on traditional fly-shuttle looms, these sarees are sturdy, breathable, and deeply rooted in a merchant tradition spanning centuries.' },
  { id:'DESC-019', key:'desc_kotpad', label:'Kotpad Tribal Cotton Saree',
    text:'Kotpad sarees carry the forest within them. Their deep terracotta and earthy tones are derived entirely from natural lac dyes extracted from plants in the Bastar forests of Odisha. Woven by Kostha tribal weavers, each saree is a piece of living forest heritage — sustainable, soulful, and entirely hand-made.' },
  { id:'DESC-020', key:'desc_dhakai', label:'Dhakai Jamdani Silk Saree',
    text:'The Dhakai Jamdani is the most refined expression of the Jamdani tradition — a silk muslin saree where supplementary silk threads create intricate floral motifs on a luminous ground. This is the saree that Mughal emperors gifted to royalty; a fabric so fine it was described as \'woven air\'.' },
  { id:'DESC-021', key:'desc_kanjivaram_bridal', label:'Kanjivaram Bridal Silk',
    text:'This Kanjivaram bridal saree represents the pinnacle of South Indian silk weaving. The rich silk body, iconic temple border, and elaborate pallu worked in fine gold zari make this an heirloom piece — designed to be passed from mother to daughter across generations.' },
  { id:'DESC-022', key:'desc_linen_silk', label:'Bhagalpuri Linen Silk Saree',
    text:'Bhagalpuri linen silk combines the breathability of linen with the subtle lustre of silk — a contemporary fusion from Bihar\'s legendary Silk City. Lightweight, elegant, and versatile, this saree is equally at home in the office and at a festive gathering.' },
  { id:'DESC-023', key:'desc_bomkai', label:'Bomkai Pure Silk Saree',
    text:'The Bomkai saree from Odisha\'s Ganjam district is a study in contrast — a striking silk saree where tribal geometric motifs and temple patterns are woven in supplementary weft, creating a visual language that bridges ancient craft and timeless beauty. Silk Mark certified and deeply treasured.' },
  { id:'DESC-024', key:'desc_ilkal', label:'Ilkal Cotton Silk Saree',
    text:'The Ilkal saree from Karnataka is instantly recognisable by its contrasting pallu — joined to the body by the unique Koppada interlocking technique found nowhere else on earth. This cotton-silk Ilkal features traditional Tope Teni border work and the distinctive warm colour palette of the Bagalkot tradition.' },
  { id:'DESC-025', key:'desc_patola', label:'Patan Patola Double Ikat',
    text:'The Patan Patola is the rarest saree in India. Created by the Salvi family of Patan — one of only three families still practising this art — a single saree involves resist-dyeing thousands of individual threads before a single row is woven. A true double Ikat and a mathematical masterpiece.' },
  { id:'DESC-026', key:'desc_bandhani', label:'Rajkot Bandhani Silk Saree',
    text:'Rajkot Bandhani is Gujarat\'s vibrant tie-dye tradition in pure silk. Thousands of tiny dots created by hand-tying generate intricate patterns of flowers, peacocks, and geometric motifs — a celebration of colour, skill, and Gujarati heritage practised for over a thousand years.' },
  { id:'DESC-027', key:'desc_tant_jamdani', label:'Tant Jamdani Fusion Cotton',
    text:'A contemporary fusion from the handloom heartland of Bengal — this saree combines the lightweight breathability of Tant cotton with the supplementary weft patterning of Jamdani. Modern in sensibility, rooted in tradition, it is perfect for the discerning everyday wearer.' },
  { id:'DESC-028', key:'desc_sungudi', label:'Madurai Sungudi Cotton Saree',
    text:'Sungudi is Madurai\'s answer to tie-dye — distinctive dot-and-motif patterns created by hand-tying tiny portions of cotton before dyeing. The Saurashtra weavers who created this tradition settled in Madurai centuries ago and continue it today, each piece carrying the memory of that migration.' },
  { id:'DESC-029', key:'desc_khadi_silk', label:'Assam Khadi Silk Saree',
    text:'Assam Khadi silk is hand-spun and hand-woven by artisans of the Brahmaputra valley, following Gandhi\'s vision of self-reliant village enterprise. The natural texture and deliberate irregularity of Khadi — impossible to replicate by machine — give it an honest, artisanal beauty that grows on you with every wearing.' },
  { id:'DESC-030', key:'desc_muga', label:'Sualkuchi Muga Silk Saree',
    text:'Sualkuchi — the Manchester of Assam — is the weaving town on the Brahmaputra where Muga silk has been woven for centuries. This rare golden silk, Silk Mark certified and exclusive to Assam, is produced from wild silkworms that feed on Som trees. Muga grows more lustrous with every wash — a saree that improves with age.' },
];

const contentBundles = [
  { id:'CB-001', name:'Baluchari Silk — Full Bundle', weaveStoryId:'WS-001', careSuggestionId:'CI-SILK', descriptionId:'DESC-001' },
  { id:'CB-002', name:'Banarasi Katan Silk — Full Bundle', weaveStoryId:'WS-002', careSuggestionId:'CI-SILK', descriptionId:'DESC-002' },
];

// ════════════════════════════════════════════════════════════
// UPDATE PRODUCT DETAIL FILES
// ════════════════════════════════════════════════════════════
const detailDir = path.join(ROOT, 'data/products');
const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/products_index.json'), 'utf8'));

idx.forEach(function(p) {
  const dPath = path.join(detailDir, p.id + '.json');
  if (!fs.existsSync(dPath)) return;
  const d = JSON.parse(fs.readFileSync(dPath, 'utf8'));

  // Care instruction — fabric-based
  const fabricKey = (d.fabric || '').toLowerCase();
  let careId = careMap[fabricKey] || null;
  if (!careId) {
    if      (fabricKey.includes('muslin'))          careId = 'CI-MUSLIN';
    else if (fabricKey.includes('tussar'))          careId = 'CI-TUSSAR';
    else if (fabricKey.includes('silk'))            careId = 'CI-SILK';
    else if (fabricKey.includes('cotton'))          careId = 'CI-COTTON';
    else                                            careId = 'CI-SILK-COTTON';
  }
  d.careSuggestionId   = careId;
  d.careInstructionId  = null; // consolidated into careSuggestionId

  // Weave story — type-based
  const typeKey = (d.type || '').toLowerCase();
  let wsId = wsMap[typeKey] || null;
  if (!wsId) {
    for (const k of Object.keys(wsMap)) {
      if (typeKey.includes(k) || k.includes(typeKey)) { wsId = wsMap[k]; break; }
    }
  }
  if (wsId) d.weaveStoryId = wsId;

  // Description — product-specific
  const descId = descMap[p.id] || null;
  if (descId) d.descriptionId = descId;

  fs.writeFileSync(dPath, JSON.stringify(d, null, 2));

  // Update contentRefs in index
  p.contentRefs = [d.weaveStoryId, d.descriptionId, d.careSuggestionId, d.contentBundleId].filter(Boolean);

  console.log(`${p.id}  care:${careId}  ws:${d.weaveStoryId}  desc:${d.descriptionId}`);
});

// Write content_library.json
const newLib = { weaveStory: weaveStories, description: descriptions, careSuggestions, contentBundles };
fs.writeFileSync(path.join(ROOT, 'data/content_library.json'), JSON.stringify(newLib, null, 2));

// Write updated products_index.json
fs.writeFileSync(path.join(ROOT, 'data/products_index.json'), JSON.stringify(idx, null, 2));

console.log(`\n✅ Done. ${idx.length} products updated. content_library.json written.`);
console.log(`   Care instructions: ${careSuggestions.length} (fabric-grouped)`);
console.log(`   Weave stories:     ${weaveStories.length}`);
console.log(`   Descriptions:      ${descriptions.length}`);
