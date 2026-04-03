/**
 * SymbioNet AI Knowledge Base
 * Comprehensive dataset for waste-to-resource intelligence.
 * No ML models — pure structured data for rule-based AI.
 */

// ─── Waste → Reuse Applications ─────────────────────────────────────────────
const WASTE_REUSE_MAP = {
  'fly ash': [
    { industry: 'Cement Industry', application: 'Portland Pozzolana Cement (PPC) production', suitability: 95, description: 'Fly ash is a key ingredient in blended cements, replacing up to 35% clinker.' },
    { industry: 'Brick Manufacturing', application: 'Fly ash bricks & blocks', suitability: 92, description: 'Lightweight, durable bricks with excellent thermal insulation.' },
    { industry: 'Road Construction', application: 'Embankment and sub-base filling', suitability: 88, description: 'Used as fill material in highway embankments and road bases.' },
    { industry: 'Agriculture', application: 'Soil amendment & fertilizer', suitability: 72, description: 'Improves soil texture, water retention, and provides trace minerals.' },
    { industry: 'Concrete Industry', application: 'High-performance concrete additive', suitability: 90, description: 'Enhances workability, strength, and durability of concrete mixes.' },
    { industry: 'Geopolymer Industry', application: 'Geopolymer cement production', suitability: 85, description: 'Base material for low-carbon geopolymer binders.' }
  ],
  'steel slag': [
    { industry: 'Road Construction', application: 'Aggregate for asphalt and road base', suitability: 93, description: 'Excellent skid resistance and high strength for road surfaces.' },
    { industry: 'Cement Industry', application: 'Slag cement (GGBS) production', suitability: 91, description: 'Ground granulated blast-furnace slag used in composite cements.' },
    { industry: 'Construction', application: 'Building aggregate and fill material', suitability: 87, description: 'Durable aggregate for construction foundations and fills.' },
    { industry: 'Agriculture', application: 'Soil conditioner (calcium silicate)', suitability: 75, description: 'Provides silicon and calcium to acidic soils.' },
    { industry: 'Railway Construction', application: 'Railway ballast material', suitability: 82, description: 'High-density aggregate for stable rail track beds.' }
  ],
  'plastic scrap': [
    { industry: 'Recycling Plant', application: 'Mechanical recycling into pellets', suitability: 94, description: 'Sorted, washed, and extruded into reusable plastic granules.' },
    { industry: 'Packaging Industry', application: 'Recycled packaging materials', suitability: 88, description: 'Converted into recycled packaging films and containers.' },
    { industry: 'Road Construction', application: 'Plastic-modified bitumen roads', suitability: 80, description: 'Mixed with bitumen to create stronger, water-resistant roads.' },
    { industry: 'Textile Industry', application: 'Synthetic fiber manufacturing', suitability: 78, description: 'PET bottles processed into polyester fibers for textiles.' },
    { industry: 'Fuel Industry', application: 'Pyrolysis oil production', suitability: 70, description: 'Thermal decomposition into liquid fuel as diesel substitute.' },
    { industry: '3D Printing', application: 'Recycled filament production', suitability: 65, description: 'Converted into 3D printing filament for additive manufacturing.' }
  ],
  'waste heat': [
    { industry: 'Power Generation', application: 'Organic Rankine Cycle (ORC) systems', suitability: 90, description: 'Converts low-grade waste heat into electricity.' },
    { industry: 'District Heating', application: 'Residential/commercial heating', suitability: 92, description: 'Pipes waste heat to nearby buildings for space heating.' },
    { industry: 'Desalination', application: 'Thermal desalination plants', suitability: 78, description: 'Uses waste heat to evaporate and purify seawater.' },
    { industry: 'Food Processing', application: 'Industrial drying processes', suitability: 85, description: 'Dries agricultural products, grains, or food ingredients.' },
    { industry: 'Greenhouse Agriculture', application: 'Heated greenhouse cultivation', suitability: 80, description: 'Maintains optimal growing temperatures year-round.' }
  ],
  'chemical byproduct': [
    { industry: 'Pharmaceutical Industry', application: 'Chemical feedstock recovery', suitability: 82, description: 'Purified byproducts used as precursors in drug synthesis.' },
    { industry: 'Fertilizer Industry', application: 'Ammonium sulfate/phosphate production', suitability: 88, description: 'Chemical byproducts converted into agricultural fertilizers.' },
    { industry: 'Paint Industry', application: 'Pigment and solvent recovery', suitability: 75, description: 'Recovered solvents and pigments for paint manufacturing.' },
    { industry: 'Water Treatment', application: 'Coagulant and pH adjustment', suitability: 80, description: 'Acidic/alkaline byproducts used in water treatment processes.' },
    { industry: 'Detergent Industry', application: 'Surfactant raw materials', suitability: 72, description: 'Chemical intermediates for cleaning product formulation.' }
  ],
  'textile waste': [
    { industry: 'Recycling Plant', application: 'Fiber recovery and reprocessing', suitability: 90, description: 'Shredded and re-spun into recycled yarn and fibers.' },
    { industry: 'Insulation Industry', application: 'Thermal & acoustic insulation', suitability: 85, description: 'Processed into building insulation batts and panels.' },
    { industry: 'Automotive Industry', application: 'Car interior padding and insulation', suitability: 78, description: 'Non-woven textile mats for vehicle sound dampening.' },
    { industry: 'Paper Industry', application: 'Specialty paper production', suitability: 70, description: 'Cotton-based textiles processed into high-quality paper.' },
    { industry: 'Geotextile Industry', application: 'Erosion control fabrics', suitability: 82, description: 'Woven into geotextile mats for soil stabilization.' }
  ],
  'rubber waste': [
    { industry: 'Road Construction', application: 'Rubberized asphalt paving', suitability: 92, description: 'Crumb rubber mixed into asphalt for flexible, durable roads.' },
    { industry: 'Sports Industry', application: 'Athletic tracks and playground surfaces', suitability: 88, description: 'Processed into shock-absorbing sports surfaces.' },
    { industry: 'Construction', application: 'Vibration dampening materials', suitability: 80, description: 'Rubber mats and pads for building vibration isolation.' },
    { industry: 'Fuel Industry', application: 'Tire-derived fuel (TDF)', suitability: 75, description: 'High calorific value fuel for cement kilns and power plants.' },
    { industry: 'Footwear Industry', application: 'Recycled rubber soles', suitability: 82, description: 'Ground rubber molded into shoe soles and components.' }
  ],
  'wood waste': [
    { industry: 'Biomass Energy', application: 'Wood pellet fuel production', suitability: 93, description: 'Compressed into pellets for biomass boilers and power generation.' },
    { industry: 'Furniture Industry', application: 'Particleboard & MDF manufacturing', suitability: 90, description: 'Chips and fibers bonded into engineered wood panels.' },
    { industry: 'Paper Industry', application: 'Pulp and paper production', suitability: 85, description: 'Processed into wood pulp for paper and cardboard.' },
    { industry: 'Agriculture', application: 'Mulch and composting material', suitability: 88, description: 'Chipped wood used as garden mulch or compost feedstock.' },
    { industry: 'Construction', application: 'Wood-polymer composite decking', suitability: 78, description: 'Mixed with polymers for weather-resistant outdoor decking.' }
  ],
  'glass waste': [
    { industry: 'Glass Manufacturing', application: 'Cullet for new glass production', suitability: 96, description: 'Crushed glass melted with raw materials — saves 30% energy.' },
    { industry: 'Construction', application: 'Aggregate and insulation material', suitability: 82, description: 'Foamed glass used as lightweight insulating aggregate.' },
    { industry: 'Road Construction', application: 'Glasphalt paving material', suitability: 78, description: 'Crushed glass mixed into asphalt as partial aggregate replacement.' },
    { industry: 'Art & Design', application: 'Decorative tiles and countertops', suitability: 75, description: 'Recycled glass cast into terrazzo-style surfaces.' },
    { industry: 'Filtration Industry', application: 'Water filtration media', suitability: 80, description: 'Crushed glass as sand replacement in water filters.' }
  ],
  'e-waste': [
    { industry: 'Metal Recovery', application: 'Precious metal extraction (Au, Ag, Pd)', suitability: 92, description: 'Circuit boards processed to recover gold, silver, and palladium.' },
    { industry: 'Recycling Plant', application: 'Component harvesting and refurbishment', suitability: 88, description: 'Working components tested and resold for reuse.' },
    { industry: 'Smelting Industry', application: 'Copper and base metal smelting', suitability: 85, description: 'Cables and connectors processed to recover copper.' },
    { industry: 'Plastic Recycling', application: 'Casing plastic recovery', suitability: 72, description: 'ABS and polycarbonate casings recycled into granules.' }
  ],
  'food waste': [
    { industry: 'Biogas Plant', application: 'Anaerobic digestion for biogas', suitability: 95, description: 'Organic waste decomposed to produce methane-rich biogas.' },
    { industry: 'Composting Facility', application: 'Organic compost production', suitability: 93, description: 'Aerobic composting into nutrient-rich soil amendment.' },
    { industry: 'Animal Feed', application: 'Processed animal feed ingredient', suitability: 78, description: 'Suitable food waste heat-treated for livestock feed.' },
    { industry: 'Biofuel Industry', application: 'Bioethanol production', suitability: 72, description: 'Fermented into bioethanol as renewable fuel.' },
    { industry: 'Fertilizer Industry', application: 'Liquid organic fertilizer', suitability: 82, description: 'Digestate from biogas used as nutrient-rich fertilizer.' }
  ],
  'construction debris': [
    { industry: 'Road Construction', application: 'Recycled aggregate for road base', suitability: 90, description: 'Crushed concrete and masonry used as road sub-base material.' },
    { industry: 'Construction', application: 'Recycled aggregate concrete (RAC)', suitability: 85, description: 'Processed into aggregate for new concrete production.' },
    { industry: 'Landscaping', application: 'Fill material and grading', suitability: 88, description: 'Used as controlled fill for land leveling and grading.' },
    { industry: 'Brick Manufacturing', application: 'Recycled material bricks', suitability: 75, description: 'Crushed debris compressed into construction blocks.' }
  ],
  'paper waste': [
    { industry: 'Paper Industry', application: 'Recycled paper and cardboard', suitability: 95, description: 'De-inked, pulped, and reformed into new paper products.' },
    { industry: 'Packaging Industry', application: 'Molded pulp packaging', suitability: 90, description: 'Egg cartons, protective packaging from recycled paper pulp.' },
    { industry: 'Insulation Industry', application: 'Cellulose insulation', suitability: 82, description: 'Shredded paper treated with fire retardant for building insulation.' },
    { industry: 'Biomass Energy', application: 'Paper briquette fuel', suitability: 70, description: 'Compressed into briquettes for biomass energy generation.' },
    { industry: 'Agriculture', application: 'Mulch and soil cover', suitability: 75, description: 'Shredded paper used as weed-suppressing garden mulch.' }
  ],
  'metal scrap': [
    { industry: 'Smelting Industry', application: 'Secondary metal smelting', suitability: 96, description: 'Melted and refined into new metal ingots and billets.' },
    { industry: 'Foundry Industry', application: 'Casting new metal components', suitability: 92, description: 'Scrap metal melted and cast into industrial parts.' },
    { industry: 'Automotive Industry', application: 'Vehicle component manufacturing', suitability: 88, description: 'Recycled metals used in car body panels and engine parts.' },
    { industry: 'Construction', application: 'Rebar and structural steel', suitability: 85, description: 'Scrap steel reformed into reinforcement bars for construction.' }
  ],
  'used oil': [
    { industry: 'Re-refining Industry', application: 'Base oil regeneration', suitability: 93, description: 'Used oil re-refined into base lubricating oil stock.' },
    { industry: 'Fuel Industry', application: 'Industrial furnace fuel', suitability: 82, description: 'Burnt as fuel in industrial furnaces and boilers.' },
    { industry: 'Asphalt Industry', application: 'Asphalt flux and modifier', suitability: 75, description: 'Blended into asphalt production as a softening agent.' },
    { industry: 'Chemical Industry', application: 'Lubricant additive recovery', suitability: 70, description: 'Valuable additives extracted for reuse in lubricant formulation.' }
  ],
  'coal ash': [
    { industry: 'Cement Industry', application: 'Cement clinker substitution', suitability: 92, description: 'Replaces raw materials in cement manufacturing.' },
    { industry: 'Brick Manufacturing', application: 'Coal ash bricks', suitability: 88, description: 'Lightweight bricks with good insulation properties.' },
    { industry: 'Road Construction', application: 'Sub-base and embankment fill', suitability: 85, description: 'Structural fill material for highway construction.' },
    { industry: 'Mining Industry', application: 'Mine void backfilling', suitability: 78, description: 'Used to fill abandoned mine voids for land reclamation.' }
  ],
  'gypsum waste': [
    { industry: 'Construction', application: 'Plasterboard manufacturing', suitability: 94, description: 'Recycled into new gypsum boards and plaster products.' },
    { industry: 'Cement Industry', application: 'Cement retarder additive', suitability: 90, description: 'Controls setting time in Portland cement production.' },
    { industry: 'Agriculture', application: 'Soil amendment for clay soils', suitability: 82, description: 'Improves soil structure and drainage in heavy clay soils.' },
    { industry: 'Ceramics Industry', application: 'Ceramic mold material', suitability: 72, description: 'Used in making plaster molds for ceramic production.' }
  ],
  'battery waste': [
    { industry: 'Metal Recovery', application: 'Lithium, cobalt, nickel recovery', suitability: 95, description: 'Hydrometallurgical extraction of valuable battery metals.' },
    { industry: 'Battery Manufacturing', application: 'Closed-loop battery recycling', suitability: 90, description: 'Recovered materials used in new battery cell production.' },
    { industry: 'Chemical Industry', application: 'Chemical compound extraction', suitability: 80, description: 'Electrolyte and compound recovery for industrial chemicals.' }
  ],
  'organic sludge': [
    { industry: 'Biogas Plant', application: 'Anaerobic digestion', suitability: 88, description: 'Sludge digested to produce biogas and digestate.' },
    { industry: 'Agriculture', application: 'Biosolid fertilizer', suitability: 82, description: 'Treated sludge applied as nutrient-rich soil conditioner.' },
    { industry: 'Biomass Energy', application: 'Sludge-to-energy incineration', suitability: 75, description: 'Dried sludge burnt for heat and power generation.' },
    { industry: 'Construction', application: 'Lightweight aggregate', suitability: 68, description: 'Sintered sludge formed into lightweight construction aggregate.' }
  ],
  'ceramic waste': [
    { industry: 'Construction', application: 'Recycled aggregate material', suitability: 85, description: 'Crushed ceramics used as aggregate in concrete and fills.' },
    { industry: 'Road Construction', application: 'Sub-base road material', suitability: 80, description: 'Crushed tiles and ceramics for road foundation layers.' },
    { industry: 'Ceramics Industry', application: 'Recycled tile production', suitability: 78, description: 'Ground ceramic waste incorporated into new tile bodies.' },
    { industry: 'Landscaping', application: 'Decorative ground cover', suitability: 72, description: 'Crushed colorful ceramics used in garden landscaping.' }
  ],
  'paint waste': [
    { industry: 'Paint Industry', application: 'Recycled paint blending', suitability: 80, description: 'Similar-color latex paints consolidated and reblended.' },
    { industry: 'Cement Industry', application: 'Alternative fuel in kilns', suitability: 72, description: 'Solvent-based paints used as supplementary kiln fuel.' },
    { industry: 'Metal Recovery', application: 'Pigment metal recovery', suitability: 68, description: 'Titanium dioxide and other pigment metals extracted.' }
  ]
};

// ─── Material Similarity Graph ───────────────────────────────────────────────
// Maps alternate names and related materials for fuzzy matching
const MATERIAL_ALIASES = {
  'fly ash':            ['flyash', 'coal fly ash', 'pfa', 'pulverized fuel ash', 'thermal plant ash'],
  'steel slag':         ['blast furnace slag', 'bof slag', 'eaf slag', 'iron slag', 'metallurgical slag'],
  'plastic scrap':      ['plastic waste', 'polymer waste', 'pet waste', 'hdpe scrap', 'ldpe scrap', 'pp scrap', 'polythene waste', 'plastic bottles'],
  'waste heat':         ['exhaust heat', 'thermal waste', 'process heat', 'flue gas heat', 'low grade heat'],
  'chemical byproduct': ['chemical waste', 'acid waste', 'alkali waste', 'solvent waste', 'chemical residue'],
  'textile waste':      ['fabric waste', 'cloth waste', 'garment waste', 'cotton waste', 'synthetic fiber waste', 'apparel waste'],
  'rubber waste':       ['tire waste', 'tyre waste', 'scrap tires', 'rubber scrap', 'vulcanized rubber waste'],
  'wood waste':         ['timber waste', 'sawdust', 'wood chips', 'lumber waste', 'plywood waste', 'mdf waste'],
  'glass waste':        ['broken glass', 'cullet', 'glass scrap', 'bottle glass', 'container glass'],
  'e-waste':            ['electronic waste', 'ewaste', 'pcb waste', 'circuit board waste', 'computer waste', 'phone waste'],
  'food waste':         ['organic waste', 'kitchen waste', 'restaurant waste', 'food scrap', 'vegetable waste', 'fruit waste'],
  'construction debris': ['c&d waste', 'demolition waste', 'concrete waste', 'masonry waste', 'rubble'],
  'paper waste':        ['cardboard waste', 'wastepaper', 'paper scrap', 'newspaper waste', 'carton waste'],
  'metal scrap':        ['scrap metal', 'iron scrap', 'steel scrap', 'aluminum scrap', 'copper scrap', 'ferrous scrap', 'non-ferrous scrap'],
  'used oil':           ['waste oil', 'spent lubricant', 'used lubricant', 'motor oil waste', 'hydraulic oil waste'],
  'coal ash':           ['bottom ash', 'boiler ash', 'furnace ash', 'coal combustion residue'],
  'gypsum waste':       ['phosphogypsum', 'flue gas desulfurization gypsum', 'fgd gypsum', 'waste gypsum', 'plaster waste'],
  'battery waste':      ['spent batteries', 'lithium battery waste', 'lead acid battery waste', 'battery scrap'],
  'organic sludge':     ['sewage sludge', 'biosolids', 'wastewater sludge', 'treatment plant sludge'],
  'ceramic waste':      ['tile waste', 'porcelain waste', 'sanitary ware waste', 'broken tiles', 'pottery waste'],
  'paint waste':        ['paint sludge', 'coating waste', 'varnish waste', 'paint residue']
};

// ─── Material Similarity Pairs (bidirectional) ──────────────────────────────
// Materials that can substitute for each other to some degree
const MATERIAL_SIMILARITIES = [
  { a: 'fly ash',       b: 'coal ash',           similarity: 0.85 },
  { a: 'fly ash',       b: 'steel slag',         similarity: 0.55 },
  { a: 'fly ash',       b: 'gypsum waste',       similarity: 0.45 },
  { a: 'steel slag',    b: 'construction debris', similarity: 0.60 },
  { a: 'plastic scrap', b: 'rubber waste',        similarity: 0.50 },
  { a: 'plastic scrap', b: 'textile waste',       similarity: 0.40 },
  { a: 'wood waste',    b: 'paper waste',          similarity: 0.65 },
  { a: 'wood waste',    b: 'food waste',           similarity: 0.35 },
  { a: 'food waste',    b: 'organic sludge',       similarity: 0.60 },
  { a: 'glass waste',   b: 'ceramic waste',        similarity: 0.50 },
  { a: 'metal scrap',   b: 'e-waste',              similarity: 0.55 },
  { a: 'metal scrap',   b: 'battery waste',        similarity: 0.45 },
  { a: 'e-waste',       b: 'battery waste',        similarity: 0.65 },
  { a: 'coal ash',      b: 'gypsum waste',         similarity: 0.50 },
  { a: 'chemical byproduct', b: 'paint waste',     similarity: 0.55 },
  { a: 'rubber waste',  b: 'used oil',             similarity: 0.30 },
  { a: 'construction debris', b: 'ceramic waste',  similarity: 0.55 },
  { a: 'textile waste',  b: 'paper waste',         similarity: 0.35 },
];

// ─── Environmental Impact Coefficients per Material ─────────────────────────
const IMPACT_COEFFICIENTS = {
  'fly ash':            { co2PerTon: 0.50, waterPerTon: 500,  energyPerTon: 0.80, costPerTon: 1500, landfillCostPerTon: 800 },
  'steel slag':         { co2PerTon: 0.40, waterPerTon: 300,  energyPerTon: 0.50, costPerTon: 2000, landfillCostPerTon: 1200 },
  'plastic scrap':      { co2PerTon: 1.50, waterPerTon: 200,  energyPerTon: 2.50, costPerTon: 5000, landfillCostPerTon: 1500 },
  'waste heat':         { co2PerTon: 0.80, waterPerTon: 0,    energyPerTon: 1.20, costPerTon: 5000, landfillCostPerTon: 0 },
  'chemical byproduct': { co2PerTon: 0.60, waterPerTon: 800,  energyPerTon: 0.40, costPerTon: 3000, landfillCostPerTon: 2000 },
  'textile waste':      { co2PerTon: 0.30, waterPerTon: 2000, energyPerTon: 0.60, costPerTon: 2500, landfillCostPerTon: 600 },
  'rubber waste':       { co2PerTon: 1.20, waterPerTon: 100,  energyPerTon: 1.80, costPerTon: 3500, landfillCostPerTon: 1000 },
  'wood waste':         { co2PerTon: 0.90, waterPerTon: 300,  energyPerTon: 1.50, costPerTon: 1200, landfillCostPerTon: 400 },
  'glass waste':        { co2PerTon: 0.35, waterPerTon: 150,  energyPerTon: 0.70, costPerTon: 1800, landfillCostPerTon: 500 },
  'e-waste':            { co2PerTon: 2.00, waterPerTon: 500,  energyPerTon: 3.00, costPerTon: 15000, landfillCostPerTon: 5000 },
  'food waste':         { co2PerTon: 0.45, waterPerTon: 600,  energyPerTon: 0.30, costPerTon: 800,  landfillCostPerTon: 300 },
  'construction debris':{ co2PerTon: 0.20, waterPerTon: 50,   energyPerTon: 0.15, costPerTon: 600,  landfillCostPerTon: 700 },
  'paper waste':        { co2PerTon: 0.70, waterPerTon: 1500, energyPerTon: 1.00, costPerTon: 2000, landfillCostPerTon: 400 },
  'metal scrap':        { co2PerTon: 1.80, waterPerTon: 400,  energyPerTon: 4.00, costPerTon: 8000, landfillCostPerTon: 2000 },
  'used oil':           { co2PerTon: 1.00, waterPerTon: 1000, energyPerTon: 2.00, costPerTon: 4000, landfillCostPerTon: 3000 },
  'coal ash':           { co2PerTon: 0.45, waterPerTon: 400,  energyPerTon: 0.70, costPerTon: 1200, landfillCostPerTon: 700 },
  'gypsum waste':       { co2PerTon: 0.25, waterPerTon: 200,  energyPerTon: 0.30, costPerTon: 1000, landfillCostPerTon: 500 },
  'battery waste':      { co2PerTon: 3.00, waterPerTon: 800,  energyPerTon: 5.00, costPerTon: 20000, landfillCostPerTon: 8000 },
  'organic sludge':     { co2PerTon: 0.35, waterPerTon: 300,  energyPerTon: 0.25, costPerTon: 600,  landfillCostPerTon: 400 },
  'ceramic waste':      { co2PerTon: 0.15, waterPerTon: 80,   energyPerTon: 0.20, costPerTon: 500,  landfillCostPerTon: 400 },
  'paint waste':        { co2PerTon: 0.80, waterPerTon: 600,  energyPerTon: 0.50, costPerTon: 2500, landfillCostPerTon: 3500 },
};

// Default coefficients for unknown materials
const DEFAULT_IMPACT = { co2PerTon: 0.35, waterPerTon: 400, energyPerTon: 0.60, costPerTon: 1800, landfillCostPerTon: 800 };

// ─── City Distance Lookup (approximate km between major Indian cities) ──────
const CITY_DISTANCES = {
  'mumbai-pune':        150,   'mumbai-nashik':       165,  'mumbai-surat':         280,
  'mumbai-ahmedabad':   530,   'mumbai-delhi':        1400, 'mumbai-bangalore':     980,
  'mumbai-hyderabad':   710,   'mumbai-chennai':      1330, 'mumbai-kolkata':       1870,
  'delhi-jaipur':       280,   'delhi-chandigarh':    250,  'delhi-lucknow':        555,
  'delhi-agra':         230,   'delhi-ahmedabad':     940,  'delhi-kolkata':        1530,
  'delhi-chennai':      2180,  'delhi-bangalore':     2150, 'delhi-hyderabad':      1580,
  'bangalore-chennai':  350,   'bangalore-hyderabad': 570,  'bangalore-pune':       840,
  'kolkata-bhubaneswar':440,   'kolkata-patna':       590,  'kolkata-chennai':      1660,
  'hyderabad-chennai':  630,   'hyderabad-pune':      560,  'ahmedabad-surat':      265,
  'ahmedabad-jaipur':   670,   'chennai-coimbatore':  510,  'pune-nashik':          210,
  'pune-hyderabad':     560,   'lucknow-patna':       540,  'jaipur-ahmedabad':     670,
  'surat-pune':         330,   'nagpur-hyderabad':    500,  'nagpur-mumbai':        800,
  'nagpur-pune':        715,   'nagpur-delhi':        1095, 'indore-bhopal':        195,
  'indore-mumbai':      590,   'bhopal-delhi':        780,  'bhopal-nagpur':        350,
  'visakhapatnam-hyderabad': 620, 'visakhapatnam-chennai': 800,
  'coimbatore-bangalore': 365, 'kochi-bangalore':     550,  'kochi-chennai':        680,
};

// ─── Industry Type → Accepted Materials ─────────────────────────────────────
const INDUSTRY_ACCEPTS = {
  'cement':         ['fly ash', 'steel slag', 'coal ash', 'gypsum waste', 'construction debris'],
  'construction':   ['steel slag', 'glass waste', 'construction debris', 'ceramic waste', 'wood waste', 'rubber waste'],
  'power':          ['wood waste', 'food waste', 'used oil', 'rubber waste'],
  'recycling':      ['plastic scrap', 'metal scrap', 'glass waste', 'paper waste', 'e-waste', 'textile waste', 'rubber waste'],
  'agriculture':    ['food waste', 'organic sludge', 'fly ash', 'gypsum waste', 'wood waste', 'paper waste'],
  'automotive':     ['metal scrap', 'rubber waste', 'plastic scrap', 'textile waste', 'glass waste'],
  'chemical':       ['chemical byproduct', 'used oil', 'paint waste'],
  'textile':        ['textile waste', 'plastic scrap'],
  'packaging':      ['paper waste', 'plastic scrap', 'glass waste'],
  'road':           ['fly ash', 'steel slag', 'plastic scrap', 'rubber waste', 'construction debris', 'glass waste', 'coal ash'],
  'food processing':['food waste', 'organic sludge', 'waste heat'],
  'pharmaceutical': ['chemical byproduct'],
  'paper':          ['paper waste', 'wood waste', 'textile waste'],
  'metal':          ['metal scrap', 'e-waste', 'battery waste'],
  'energy':         ['waste heat', 'wood waste', 'used oil', 'food waste', 'paper waste', 'rubber waste'],
};

module.exports = {
  WASTE_REUSE_MAP,
  MATERIAL_ALIASES,
  MATERIAL_SIMILARITIES,
  IMPACT_COEFFICIENTS,
  DEFAULT_IMPACT,
  CITY_DISTANCES,
  INDUSTRY_ACCEPTS
};
