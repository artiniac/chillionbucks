/* Chillion Builder catalog: the kits (shelves), every buyable thing, and the Job Board.
   Depends on builder-art.js (window.CB_ART). Exposes window.CB_CATALOG. */
(() => {
  'use strict';
  const A = window.CB_ART, S = A.S, P = A.P, H = A.H, Z = A.Z, VH = A.VH;

  /* Shelves. Each thing belongs to exactly one kit; jobs count things per kit. */
  const KITS = [
    { id: 'blocks', e: '🧱', name: 'Snap Blocks' }, { id: 'tiles', e: '🔷', name: 'Magnet Tiles' }, { id: 'pieces', e: '🧩', name: 'Build parts' },
    { id: 'waterpark', e: '🏊', name: 'Water park' }, { id: 'themepark', e: '🎢', name: 'Theme park' },
    { id: 'zoo', e: '🦁', name: 'Zoo & jungle' }, { id: 'city', e: '🏙️', name: 'City & school' },
    { id: 'castle', e: '🏰', name: 'Castle' }, { id: 'space', e: '🚀', name: 'Space' },
    { id: 'beach', e: '🏖️', name: 'Beach & sea' }, { id: 'nature', e: '🌳', name: 'Nature' },
    { id: 'home', e: '🛋️', name: 'Home & treats' }, { id: 'vehicles', e: '🚗', name: 'Vehicles' },
    { id: 'people', e: '🧒', name: 'People' }, { id: 'characters', e: '🦸', name: 'Characters' },
  ];

  /* V = hand-drawn sticker, E = emoji sticker, G = grid piece (snaps; w = cols/24), B = Snap Block */
  const V = (id, kit, name, price, w, svg, x = {}) => ({ id, kit, name, price, w, svg, ...x });
  const E = (id, kit, name, e, price, w = .14) => ({ id, kit, name, e, price, w });
  /* every snap-together STRUCTURE piece is free (Artin 2026-09-05: building never costs; decorations, rides, characters, and vehicles do) */
  const G = (id, kit, name, price, cols, svg, x = {}) => ({ id, kit, name, price: 0, w: cols / 24, cols, svg, snap: true, ...x });
  /* a block's art is cols cells of front face plus a DEPTH-wide side face; snapTop = the share of its height that is top face + studs */
  const B = (id, name, price, cols, rows, shape = 'brick') => ({ id, kit: 'blocks', name, price: 0, w: (cols + A.DEPTH / A.U) / 24, cols, rows, shape, snap: true, block: true, snapTop: (A.STUD + A.DEPTH) / (rows * A.U + A.STUD + A.DEPTH), colorable: true, color: 'red', svg: (u, it) => A.blockSVG(u, it, cols, rows, shape) });
  const T = (id, name, price, cols, shape) => ({ id, kit: 'tiles', name, price: 0, w: cols / 24, cols, shape, snap: true, colorable: true, color: 'blue', svg: (u, it) => A.tileSVG(u, it, shape) });
  const CL = (c) => ({ colorable: true, color: c });

  const ITEMS = [
    /* Snap Blocks: studded building blocks in ten colors */
    B('b1', '1 block', 1, 1, 1), B('b2', '2 block', 1, 2, 1), B('b3', '3 block', 1, 3, 1), B('b4', '4 block', 2, 4, 1), B('b6', '6 block', 2, 6, 1),
    B('b22', '2 x 2 block', 2, 2, 2), B('b42', '4 x 2 block', 3, 4, 2), B('bslope', 'Slope', 1, 2, 1, 'slope'), B('barch', 'Arch block', 2, 2, 2, 'arch'),
    B('bwin', 'Window block', 2, 2, 2, 'window'), B('bdoor', 'Door block', 2, 2, 3, 'door'), B('bround', 'Round block', 1, 1, 1, 'round'),
    /* Magnet Tiles: translucent shapes that build see-through houses, towers, and castles */
    T('tsq', 'Square tile', 1, 2, 'sq'), T('tbig', 'Big square', 2, 4, 'big'), T('ttri', 'Triangle', 1, 2, 'tri'), T('trtri', 'Corner triangle', 1, 2, 'rtri'),
    T('ttall', 'Tall triangle', 1, 2, 'tall'), T('trect', 'Long tile', 2, 4, 'rect'), T('twin', 'Window tile', 1, 2, 'win'), T('tarch', 'Door tile', 1, 2, 'arch'),
    /* Build parts: walls, roofs, floors, fences, paths, slides */
    G('wall', 'pieces', 'Brick wall', 3, 4, P.wall, CL('orange')), G('wallTall', 'pieces', 'Tall wall', 3, 2, P.wallTall, CL('orange')), G('roof', 'pieces', 'Roof', 3, 4, P.roof, CL('red')),
    G('door', 'pieces', 'Door', 1, 1, P.door, CL('brown')), G('window', 'pieces', 'Window', 1, 1, P.window, CL('white')), G('floorTile', 'pieces', 'Floor tile', 1, 2, P.floorTile, CL('yellow')),
    G('waterTile', 'pieces', 'Water tile', 1, 2, P.waterTile), G('grassTile', 'pieces', 'Grass tile', 1, 2, P.grassTile), G('sandTile', 'pieces', 'Sand tile', 1, 2, P.sandTile),
    G('fence', 'pieces', 'Fence', 1, 4, P.fence, CL('white')), G('hedge', 'pieces', 'Hedge', 1, 2, P.hedge), G('path', 'pieces', 'Path', 1, 2, P.path),
    G('bridge', 'pieces', 'Bridge', 5, 6, P.bridge), G('stairs', 'pieces', 'Stairs', 2, 2, P.stairs, CL('white')), G('ladder', 'pieces', 'Ladder', 1, 1, P.ladder, CL('yellow')), G('pillar', 'pieces', 'Pillar', 2, 1, P.pillar, CL('white')),
    G('slideRamp', 'pieces', 'Slide', 2, 4, P.slideRamp, CL('yellow')), G('slideSteep', 'pieces', 'Steep slide', 2, 2, P.slideSteep, CL('yellow')), G('slideCurve', 'pieces', 'Curvy slide', 3, 4, P.slideCurve, CL('yellow')), G('slideTop', 'pieces', 'Slide platform', 1, 2, P.slideTop, CL('blue')),
    /* Water park */
    V('pool', 'waterpark', 'Big pool', 20, .42, S.pool), V('roundpool', 'waterpark', 'Round pool', 14, .3, S.roundpool), V('lazyriver', 'waterpark', 'Lazy river', 25, .5, S.lazyriver),
    V('hottub', 'waterpark', 'Hot tub', 8, .22, S.hottub), V('waterslide', 'waterpark', 'Water slide', 18, .3, S.waterslide), V('waterfall', 'waterpark', 'Waterfall', 12, .26, S.waterfall),
    V('fountain', 'waterpark', 'Fountain', 6, .2, S.fountain), V('splashpad', 'waterpark', 'Splash pad', 9, .26, S.splashpad), V('aquarium', 'waterpark', 'Aquarium', 15, .3, S.aquarium),
    V('lifeguardChair', 'waterpark', 'Lifeguard chair', 5, .16, H.lifeguardChair), V('loungeChair', 'waterpark', 'Lounge chair', 3, .2, H.loungeChair, CL('blue')), V('snackBar', 'waterpark', 'Snack bar', 10, .26, H.snackBar),
    V('floatRing', 'waterpark', 'Float ring', 2, .12, H.floatRing, CL('pink')), V('divingBoard', 'waterpark', 'Diving board', 6, .22, H.divingBoard),
    G('riverStraight', 'waterpark', 'Lazy river', 3, 4, P.riverStraight), G('riverCurve', 'waterpark', 'River curve', 4, 4, P.riverCurve), G('riverEnd', 'waterpark', 'River end', 3, 4, P.riverEnd), G('poolEdge', 'waterpark', 'Pool edge', 1, 4, P.poolEdge),
    V('tubeSlide', 'waterpark', 'Tube slide', 14, .3, H.tubeSlide, CL('green')), V('twistySlide', 'waterpark', 'Twisty slide', 12, .28, H.twistySlide, CL('purple')), V('kiddieSlide', 'waterpark', 'Kiddie slide', 5, .2, H.kiddieSlide, CL('yellow')),
    V('dropSlide', 'waterpark', 'Drop slide', 16, .22, H.dropSlide, CL('red')), V('wavePool', 'waterpark', 'Wave pool', 22, .46, H.wavePool), V('sprayMushroom', 'waterpark', 'Spray mushroom', 4, .16, H.sprayMushroom, CL('pink')),
    V('tubeRider', 'waterpark', 'Kid on a tube', 2, .1, H.tubeRider, CL('yellow')), V('raft', 'waterpark', 'Family raft', 4, .16, H.raft, CL('orange')),
    V('grotto', 'waterpark', 'Waterfall cave', 12, .3, H.grotto), V('poolSlide', 'waterpark', 'Pool slide', 5, .2, H.poolSlide, CL('blue')), V('waterCannon', 'waterpark', 'Water cannon', 4, .18, H.waterCannon, CL('red')),
    V('poolLadder', 'waterpark', 'Pool ladder', 1, .08, H.poolLadder), V('swimBar', 'waterpark', 'Swim-up snack hut', 8, .24, H.swimBar), V('geyser', 'waterpark', 'Geyser', 5, .14, H.geyser),
    V('bubbleJets', 'waterpark', 'Jacuzzi jets', 3, .18, H.bubbleJets), V('poolLight', 'waterpark', 'Pool light', 1, .1, H.poolLight, CL('blue')), V('divingRock', 'waterpark', 'Diving rock', 6, .22, H.divingRock),
    E('wave', 'waterpark', 'Wave', '🌊', 2, .16), E('drop', 'waterpark', 'Water drop', '💧', 0, .08), E('ice', 'waterpark', 'Ice block', '🧊', 1, .1),
    /* Theme park */
    V('ferrisWheel', 'themepark', 'Ferris wheel', 20, .3, H.ferrisWheel), V('carousel', 'themepark', 'Carousel', 12, .26, H.carousel), E('coaster', 'themepark', 'Roller coaster', 25, .36),
    G('trackStraight', 'themepark', 'Coaster track', 2, 4, P.trackStraight), G('trackHill', 'themepark', 'Coaster hill', 3, 4, P.trackHill), G('trackLoop', 'themepark', 'Coaster loop', 6, 4, P.trackLoop),
    V('coasterCar', 'themepark', 'Coaster car', 3, .14, H.coasterCar, CL('blue')), V('bumperCars', 'themepark', 'Bumper cars', 12, .3, H.bumperCars), V('foodCart', 'themepark', 'Food cart', 5, .18, H.foodCart, CL('red')),
    V('entranceArch', 'themepark', 'Entrance sign', 8, .3, H.entranceArch, { label: true, def: 'FUN PARK' }), V('ticketBooth', 'themepark', 'Ticket booth', 4, .14, H.ticketBooth),
    V('slide', 'themepark', 'Slide', 8, .22, S.slide), V('trampoline', 'themepark', 'Trampoline', 7, .22, S.trampoline), V('swingset', 'themepark', 'Swing set', 6, .24, S.swingset),
    E('kite', 'themepark', 'Kite', '🪁', 1, .1), E('balloon', 'themepark', 'Balloon', '🎈', 1, .09), E('circus', 'themepark', 'Circus tent', '🎪', 10, .24),
    /* Zoo and jungle */
    V('zooPen', 'zoo', 'Animal pen', 6, .32, H.zooPen), G('zooBars', 'zoo', 'Zoo bars', 2, 4, P.zooBars), V('habitatSign', 'zoo', 'Habitat sign', 2, .16, H.habitatSign, { label: true, def: 'LIONS' }),
    V('vine', 'zoo', 'Jungle vine', 1, .1, H.vine), V('ropeBridge', 'zoo', 'Rope bridge', 5, .3, H.ropeBridge), V('hut', 'zoo', 'Jungle hut', 6, .22, H.hut),
    E('lion', 'zoo', 'Lion', '🦁', 4, .13), E('elephant', 'zoo', 'Elephant', '🐘', 5, .18), E('giraffe', 'zoo', 'Giraffe', '🦒', 5, .18), E('monkey', 'zoo', 'Monkey', '🐵', 3, .11), E('parrot', 'zoo', 'Parrot', '🦜', 3, .11),
    E('penguin', 'zoo', 'Penguin', '🐧', 2, .11), E('panda', 'zoo', 'Panda', '🐼', 4, .13), E('bear', 'zoo', 'Bear', '🐻', 3, .13), E('koala', 'zoo', 'Koala', '🐨', 3, .12), E('flamingo', 'zoo', 'Flamingo', '🦩', 3, .14),
    E('croc', 'zoo', 'Crocodile', '🐊', 4, .16), E('trex', 'zoo', 'T. rex', '🦖', 6, .2), E('bronto', 'zoo', 'Long-neck dino', '🦕', 6, .2), E('dragon', 'zoo', 'Dragon', '🐉', 9, .22), E('unicorn', 'zoo', 'Unicorn', '🦄', 7, .16),
    E('cat', 'zoo', 'Cat', '🐱', 2, .1), E('dog', 'zoo', 'Dog', '🐶', 2, .1), E('butterfly', 'zoo', 'Butterfly', '🦋', 1, .09), E('bee', 'zoo', 'Bee', '🐝', 1, .07), E('frog', 'zoo', 'Frog', '🐸', 1, .09),
    E('zebra', 'zoo', 'Zebra', '🦓', 4, .14), E('hippo', 'zoo', 'Hippo', '🦛', 4, .15), E('gorilla', 'zoo', 'Gorilla', '🦍', 4, .14), E('tiger', 'zoo', 'Tiger', '🐯', 4, .13), E('snake', 'zoo', 'Snake', '🐍', 2, .12),
    /* City and school */
    V('schoolBuilding', 'city', 'School', 12, .38, H.schoolBuilding), V('cityBuilding', 'city', 'Apartment building', 7, .18, H.cityBuilding, CL('blue')), V('skyscraper', 'city', 'Skyscraper', 10, .16, H.skyscraper),
    G('garageLevel', 'city', 'Garage deck', 3, 6, P.garageLevel), G('garageRamp', 'city', 'Garage ramp', 1, 2, P.garageRamp),
    G('road', 'city', 'Road', 1, 4, P.road), G('roadCorner', 'city', 'Road corner', 1, 2, P.roadCorner), G('crossing', 'city', 'Crosswalk', 1, 4, P.crossing), G('sidewalk', 'city', 'Sidewalk', 1, 4, P.sidewalk),
    V('trafficLight', 'city', 'Traffic light', 2, .07, H.trafficLight), V('streetLamp', 'city', 'Street lamp', 2, .08, H.streetLamp), V('busStop', 'city', 'Bus stop', 3, .18, H.busStop),
    V('flagpole', 'city', 'Flagpole', 2, .1, H.flagpole, CL('green')), V('bench', 'city', 'Bench', 1, .16, H.bench, CL('brown')), V('hydrant', 'city', 'Fire hydrant', 1, .06, H.hydrant),
    E('house', 'city', 'House', '🏠', 6, .22), E('office', 'city', 'Office tower', '🏢', 5, .2), E('hospital', 'city', 'Hospital', '🏥', 8, .24), E('store', 'city', 'Store', '🏪', 5, .2), E('stadium', 'city', 'Stadium', '🏟️', 10, .3),
    E('statue', 'city', 'Statue', '🗽', 5, .16), E('tower', 'city', 'Tower', '🗼', 8, .22), E('bridgeBig', 'city', 'Big bridge', '🌉', 6, .3), E('shrine', 'city', 'Gate', '⛩️', 4, .2), E('cone', 'city', 'Traffic cone', '🚧', 1, .1),
    V('sign', 'city', 'Sign (your words!)', 1, .22, S.sign, { label: true, def: 'LEO’S WORLD' }), E('mailbox', 'city', 'Mailbox', '📮', 1, .08), E('fountainSmall', 'city', 'Clock', '🕰️', 2, .1),
    /* Castle */
    G('castleWall', 'castle', 'Castle wall', 4, 4, P.castleWall, CL('white')), G('castleTower', 'castle', 'Castle tower', 6, 2, P.castleTower, CL('white')), G('castleGate', 'castle', 'Castle gate', 6, 4, P.castleGate, CL('white')),
    V('banner', 'castle', 'Banner', 1, .08, H.banner, CL('purple')), V('throne', 'castle', 'Throne', 5, .14, H.throne, CL('red')),
    E('castle', 'castle', 'Castle', '🏰', 12, .3), E('crown', 'castle', 'Crown', '👑', 4, .12), E('shield', 'castle', 'Shield', '🛡️', 2, .1), E('sword', 'castle', 'Sword', '🗡️', 2, .1), E('horse', 'castle', 'Horse', '🐎', 4, .16),
    E('treasure', 'castle', 'Gold', '💰', 3, .1), E('gem', 'castle', 'Gem', '💎', 3, .09), E('crystal', 'castle', 'Crystal ball', '🔮', 2, .1), E('scroll', 'castle', 'Scroll', '📜', 1, .09),
    /* Space */
    V('spaceModule', 'space', 'Space module', 10, .3, H.spaceModule), G('spaceTube', 'space', 'Space tube', 2, 4, P.spaceTube), V('solarPanel', 'space', 'Solar panel', 3, .18, H.solarPanel),
    V('rocketPad', 'space', 'Rocket pad', 12, .28, H.rocketPad), V('dish', 'space', 'Space dish', 4, .16, H.dish), V('spaceFlag', 'space', 'Space flag', 1, .09, H.spaceFlag, CL('blue')),
    V('portal', 'space', 'Portal', 10, .22, S.portal), V('hoverboard', 'space', 'Hoverboard', 5, .2, S.hoverboard),
    E('rocket', 'space', 'Rocket', '🚀', 8, .18), E('ufo', 'space', 'UFO', '🛸', 7, .2), E('robot', 'space', 'Robot', '🤖', 6, .14), E('satellite', 'space', 'Satellite', '🛰️', 4, .16), E('alien', 'space', 'Alien', '👽', 3, .12),
    E('planet', 'space', 'Planet', '🪐', 5, .2), E('shooting', 'space', 'Shooting star', '🌠', 2, .16), E('moonRock', 'space', 'Moon', '🌕', 3, .14), E('zap', 'space', 'Lightning', '⚡', 1, .1), E('magnet', 'space', 'Magnet', '🧲', 1, .1), E('telescope', 'space', 'Telescope', '🔭', 3, .12),
    /* Beach and sea */
    V('pier', 'beach', 'Pier', 6, .34, H.pier), V('sandcastle', 'beach', 'Sandcastle', 3, .18, H.sandcastle), V('lifeguardTower', 'beach', 'Lifeguard tower', 6, .2, H.lifeguardTower),
    V('towel', 'beach', 'Beach towel', 1, .16, H.towel, CL('orange')), V('treasureChest', 'beach', 'Treasure chest', 5, .14, H.treasureChest), V('buoy', 'beach', 'Buoy', 1, .08, H.buoy),
    V('submarine', 'beach', 'Submarine', 9, .24, S.submarine), V('pirateship', 'beach', 'Pirate ship', 14, .28, S.pirateship), V('jetski', 'beach', 'Jet ski', 6, .2, S.jetski), V('lighthouse', 'beach', 'Lighthouse', 7, .18, S.lighthouse),
    E('sailboat', 'beach', 'Sailboat', '⛵', 5, .16), E('speedboat', 'beach', 'Speedboat', '🚤', 6, .16), E('ship', 'beach', 'Big ship', '🚢', 10, .22), E('canoe', 'beach', 'Canoe', '🛶', 3, .14), E('surf', 'beach', 'Surfer', '🏄', 3, .12),
    E('umbrella', 'beach', 'Beach umbrella', '🏖️', 3, .16), E('coconut', 'beach', 'Coconut', '🥥', 1, .07), E('pineapple', 'beach', 'Pineapple', '🍍', 1, .08), E('shell', 'beach', 'Shell', '🐚', 0, .07), E('anchor', 'beach', 'Anchor', '⚓', 2, .1),
    E('dolphin', 'beach', 'Dolphin', '🐬', 4), E('shark', 'beach', 'Shark', '🦈', 5, .16), E('octopus', 'beach', 'Octopus', '🐙', 4), E('whale', 'beach', 'Whale', '🐳', 6, .2), E('turtle', 'beach', 'Turtle', '🐢', 3, .12),
    E('tropfish', 'beach', 'Tropical fish', '🐠', 1, .1), E('fish', 'beach', 'Fish', '🐟', 0, .09), E('crab', 'beach', 'Crab', '🦀', 2, .1), E('seal', 'beach', 'Seal', '🦭', 3, .12), E('mermaid', 'beach', 'Mermaid', '🧜', 5, .14),
    E('squid', 'beach', 'Squid', '🦑', 3, .12), E('lobster', 'beach', 'Lobster', '🦞', 2, .1), E('puffer', 'beach', 'Puffer fish', '🐡', 2, .1),
    /* Nature */
    V('pond', 'nature', 'Pond', 5, .26, S.pond), V('treehouse', 'nature', 'Treehouse', 9, .26, S.treehouse),
    E('palm', 'nature', 'Palm tree', '🌴', 2, .2), E('tree', 'nature', 'Tree', '🌳', 2, .2), E('pine', 'nature', 'Pine tree', '🌲', 2, .2), E('cactus', 'nature', 'Cactus', '🌵', 1, .14), E('blossom', 'nature', 'Blossom', '🌸', 0, .08),
    E('sunflower', 'nature', 'Sunflower', '🌻', 1, .1), E('hibiscus', 'nature', 'Hibiscus', '🌺', 1, .09), E('tulip', 'nature', 'Tulip', '🌷', 1, .08), E('mushroom', 'nature', 'Mushroom', '🍄', 1, .1), E('rainbow', 'nature', 'Rainbow', '🌈', 6, .3),
    E('sun', 'nature', 'Sun', '☀️', 3, .14), E('cloud', 'nature', 'Cloud', '☁️', 1, .16), E('moon', 'nature', 'Moon', '🌙', 3, .12), E('star', 'nature', 'Star', '⭐', 1, .08), E('volcano', 'nature', 'Volcano', '🌋', 8, .28),
    E('mountain', 'nature', 'Mountain', '🏔️', 5, .3), E('rock', 'nature', 'Rock', '🪨', 0, .1), E('campfire', 'nature', 'Campfire', '🔥', 2, .12), E('tent', 'nature', 'Tent', '⛺', 4, .18), E('snowflake', 'nature', 'Snowflake', '❄️', 1, .09),
    E('snowman', 'nature', 'Snowman', '⛄', 3, .14), E('leaf', 'nature', 'Leaf', '🍃', 0, .08), E('bush', 'nature', 'Bush', '🌿', 1, .1), E('deer', 'nature', 'Deer', '🦌', 3, .14), E('fox', 'nature', 'Fox', '🦊', 3, .12), E('owl', 'nature', 'Owl', '🦉', 2, .1),
    /* Home and treats */
    E('bed', 'home', 'Bed', '🛏️', 4, .22), E('couch', 'home', 'Couch', '🛋️', 4, .22), E('chair', 'home', 'Chair', '🪑', 1, .12), E('tv', 'home', 'TV', '📺', 3, .16), E('gamepad', 'home', 'Game controller', '🎮', 3, .12),
    E('teddy', 'home', 'Teddy bear', '🧸', 2, .12), E('books', 'home', 'Books', '📚', 1, .12), E('piano', 'home', 'Piano', '🎹', 5, .18), E('guitar', 'home', 'Guitar', '🎸', 3, .14), E('drum', 'home', 'Drum', '🥁', 3, .14),
    E('cake', 'home', 'Cake', '🎂', 2, .12), E('pizza', 'home', 'Pizza', '🍕', 2, .11), E('icecream', 'home', 'Ice cream', '🍦', 1, .1), E('donut', 'home', 'Donut', '🍩', 1, .1), E('popcorn', 'home', 'Popcorn', '🍿', 1, .1),
    E('gift', 'home', 'Gift', '🎁', 2, .11), E('trophy', 'home', 'Trophy', '🏆', 3, .12), E('picture', 'home', 'Picture frame', '🖼️', 1, .14), E('plant', 'home', 'House plant', '🪴', 1, .12), E('bathtub', 'home', 'Bathtub', '🛁', 3, .16),
    E('darts', 'home', 'Dartboard', '🎯', 2, .12), E('bowling', 'home', 'Bowling', '🎳', 2, .12), E('soccer', 'home', 'Soccer ball', '⚽', 1, .08), E('bball', 'home', 'Basketball', '🏀', 1, .08), E('skate', 'home', 'Skateboard', '🛹', 2, .12),
    E('lamp', 'home', 'Lamp', '🛋', 1, .1), E('clock', 'home', 'Alarm clock', '⏰', 1, .08), E('computer', 'home', 'Computer', '🖥️', 4, .14), E('robotToy', 'home', 'Toy robot', '🪀', 1, .08),
    /* Vehicles */
    E('car', 'vehicles', 'Car', '🚗', 3, .16), E('racecar', 'vehicles', 'Race car', '🏎️', 5, .18), E('truck', 'vehicles', 'Truck', '🚚', 3, .18), E('firetruck', 'vehicles', 'Fire truck', '🚒', 4, .18), E('police', 'vehicles', 'Police car', '🚓', 3, .16),
    E('bus', 'vehicles', 'Bus', '🚌', 3, .18), E('schoolbus', 'vehicles', 'School bus', '🚍', 3, .18), E('train', 'vehicles', 'Train', '🚂', 5, .2), E('plane', 'vehicles', 'Airplane', '✈️', 6, .2), E('heli', 'vehicles', 'Helicopter', '🚁', 5, .18),
    E('bike', 'vehicles', 'Bike', '🚲', 2, .14), E('scooter', 'vehicles', 'Scooter', '🛴', 1, .12), E('moped', 'vehicles', 'Moped', '🛵', 2, .14), E('tractor', 'vehicles', 'Tractor', '🚜', 3, .16), E('ambulance', 'vehicles', 'Ambulance', '🚑', 4, .18),
    E('taxi', 'vehicles', 'Taxi', '🚕', 3, .16), E('monorail', 'vehicles', 'Monorail', '🚝', 5, .2), E('tram', 'vehicles', 'Tram', '🚊', 4, .18),
    V('skyRacer', 'vehicles', 'Sky Racer coupe', 6, .2, VH.skyRacer, CL('blue')), V('redRocket', 'vehicles', 'Rocket coupe', 6, .2, VH.redRocket, CL('red')), V('boxyClassic', 'vehicles', 'Boxy classic', 5, .2, VH.boxyClassic, CL('white')),
    V('pickup', 'vehicles', 'Pickup truck', 4, .2, VH.pickup, CL('red')), V('boxTruck', 'vehicles', 'Box truck (your words!)', 5, .22, VH.boxTruck, { ...CL('white'), label: true, def: 'CHILLION' }), V('semiTruck', 'vehicles', 'Big rig', 7, .3, VH.semiTruck, CL('blue')),
    V('forklift', 'vehicles', 'Forklift', 4, .14, VH.forklift, CL('yellow')), V('tractorBig', 'vehicles', 'Big tractor', 5, .18, VH.tractorBig, CL('green')), V('yacht', 'vehicles', 'Yacht', 8, .24, VH.yacht, CL('white')),
    V('monsterTruck', 'vehicles', 'Monster truck (your words!)', 7, .24, VH.monsterTruck, { ...CL('green'), label: true, def: 'CHILLZILLA' }), V('passengerJet', 'vehicles', 'Passenger jet', 10, .34, VH.passengerJet, CL('white')), V('fighterJet', 'vehicles', 'Fighter jet', 8, .28, VH.fighterJet, CL('black')), V('stealthJet', 'vehicles', 'Stealth jet', 9, .28, VH.stealthJet, CL('blue')), V('militaryHeli', 'vehicles', 'Rescue helicopter', 8, .26, VH.militaryHeli, CL('green')),
    /* People (the pal maker comes first, it is the star) */
    V('pal', 'people', 'Make a pal!', 3, .11, H.pal, { pal: true, colorable: true, color: 'red' }),
    E('kid', 'people', 'Kid', '🧒', 1, .09), E('girl', 'people', 'Girl', '👧', 1, .09), E('boy', 'people', 'Boy', '👦', 1, .09), E('baby', 'people', 'Baby', '👶', 1, .08), E('mom', 'people', 'Mom', '👩', 1, .09), E('dad', 'people', 'Dad', '👨', 1, .09),
    E('grandma', 'people', 'Grandma', '👵', 2, .09), E('grandpa', 'people', 'Grandpa', '👴', 2, .09), E('teacher', 'people', 'Teacher', '🧑‍🏫', 2, .1), E('doctor', 'people', 'Doctor', '🧑‍⚕️', 2, .1), E('firefighter', 'people', 'Firefighter', '🧑‍🚒', 2, .1),
    E('officer', 'people', 'Police officer', '👮', 2, .1), E('astronaut', 'people', 'Astronaut', '🧑‍🚀', 3, .1), E('chef', 'people', 'Chef', '🧑‍🍳', 2, .1), E('builder', 'people', 'Builder', '👷', 2, .1), E('farmer', 'people', 'Farmer', '🧑‍🌾', 2, .1),
    E('scientist', 'people', 'Scientist', '🧑‍🔬', 2, .1), E('artist', 'people', 'Artist', '🧑‍🎨', 2, .1), E('king', 'people', 'King', '🤴', 3, .1), E('queen', 'people', 'Queen', '👸', 3, .1), E('hero', 'people', 'Superhero', '🦸', 3, .1),
    E('wizard', 'people', 'Wizard', '🧙', 3, .1), E('fairy', 'people', 'Fairy', '🧚', 3, .1), E('swimmer', 'people', 'Swimmer', '🏊', 2, .1), E('dancer', 'people', 'Dancer', '💃', 2, .1), E('family', 'people', 'Family', '👨‍👩‍👧‍👦', 3, .16),
    E('lifeguard', 'people', 'Lifeguard', '🛟', 1, .08), E('pilot', 'people', 'Pilot', '🧑‍✈️', 2, .1), E('mechanic', 'people', 'Mechanic', '🧑‍🔧', 2, .1), E('singer', 'people', 'Singer', '🧑‍🎤', 2, .1),
    /* Characters: our own pals with the shapes and sizes kids love, plus real animals */
    V('dash', 'characters', 'Dash the hedgehog', 4, .1, Z.dash, CL('blue')), V('midnight', 'characters', 'Midnight', 4, .1, Z.midnight, CL('black')), V('rocky', 'characters', 'Rocky', 4, .105, Z.rocky, CL('red')),
    V('rosie', 'characters', 'Rosie', 4, .095, Z.rosie, CL('pink')), V('echo', 'characters', 'Echo the bat', 4, .11, Z.echo, CL('white')), V('drOvo', 'characters', 'Dr. Ovo', 5, .14, Z.drOvo, CL('red')),
    V('plumber', 'characters', 'Jumpy the plumber', 4, .09, Z.plumber, { ...CL('red'), label: true, def: 'J' }), V('spongy', 'characters', 'Spongy', 4, .085, Z.spongy, CL('yellow')), V('squiggy', 'characters', 'Squiggy', 4, .08, Z.squiggy, CL('blue')),
    V('captainCrab', 'characters', 'Captain Crab', 4, .12, Z.captainCrab, CL('red')), V('shelly', 'characters', 'Shelly the snail', 3, .08, Z.shelly, CL('pink')), V('starPat', 'characters', 'Star Pat', 4, .1, Z.starPat, CL('pink')),
    V('bluePup', 'characters', 'Blue Pup', 4, .085, Z.bluePup, CL('blue')), V('zappy', 'characters', 'Zappy', 4, .08, Z.zappy, CL('yellow')), V('frostDragon', 'characters', 'Frost Dragon', 9, .24, Z.frostDragon, CL('white')),
    V('skaterOtto', 'characters', 'Otis the skater', 3, .08, Z.skaterOtto, CL('red')), V('skaterReggie', 'characters', 'Regan the skater', 3, .085, Z.skaterReggie, CL('purple')), V('skaterTwister', 'characters', 'Twizzle', 3, .08, Z.skaterTwister, CL('green')), V('skaterSam', 'characters', 'Sammy the squid kid', 3, .085, Z.skaterSam, CL('blue')),
    V('ogre', 'characters', 'Big Green Ogre', 5, .14, Z.ogre, CL('green')),
    V('germanShepherd', 'characters', 'German shepherd', 3, .12, Z.germanShepherd), V('husky', 'characters', 'Husky', 3, .12, Z.husky), V('rottweiler', 'characters', 'Rottweiler', 3, .125, Z.rottweiler),
    V('pomeranian', 'characters', 'Pomeranian', 2, .07, Z.pomeranian), V('retriever', 'characters', 'Golden retriever', 3, .12, Z.retriever), V('kitty', 'characters', 'Kitty', 2, .08, Z.kitty, CL('orange')), V('lionKing', 'characters', 'Lion', 4, .14, Z.lionKing),
  ];
  /* Picture sprites (PNG with a transparent background) from sprites.js join the catalog as image items. */
  (window.CHILLION_SPRITES || []).forEach(sp => { if (sp && sp.id && sp.src && !ITEMS.some(d => d.id === sp.id)) ITEMS.push({ id: sp.id, kit: KITS.some(k => k.id === sp.kit) ? sp.kit : 'home', name: sp.name || sp.id, price: Math.max(0, Math.round(+sp.price || 0)), w: Math.min(.6, Math.max(.05, +sp.w || .2)), img: sp.src, label: false, go: ['drive', 'fly', 'float', 'walk', 'swim', 'spin'].includes(sp.go) ? sp.go : undefined }); });
  const GO_BY_KIND = { plane: 'fly', heli: 'fly', passengerJet: 'fly', fighterJet: 'fly', stealthJet: 'fly', militaryHeli: 'fly', rocket: 'fly', ufo: 'fly', satellite: 'fly', shooting: 'fly', balloon: 'fly', kite: 'fly', hoverboard: 'fly', butterfly: 'fly', bee: 'fly', parrot: 'fly', owl: 'fly',
    sailboat: 'float', speedboat: 'float', ship: 'float', canoe: 'float', yacht: 'float', pirateship: 'float', jetski: 'float', submarine: 'swim', tubeRider: 'float', raft: 'float', floatRing: 'float', buoy: 'float', surf: 'float', swimmer: 'swim',
    dolphin: 'swim', shark: 'swim', octopus: 'swim', whale: 'swim', turtle: 'swim', tropfish: 'swim', fish: 'swim', crab: 'walk', seal: 'swim', mermaid: 'swim', squid: 'swim', lobster: 'walk', shrimp: 'swim', puffer: 'swim',
    sun: 'spin', star: 'spin', snowflake: 'spin', gem: 'spin', planet: 'spin', moonRock: 'spin', coasterCar: 'drive', monsterTruck: 'drive', train: 'drive', monorail: 'drive', tram: 'drive', cat: 'walk', dog: 'walk', frog: 'walk', snake: 'walk' };
  const GO_BY_KIT = { vehicles: 'drive', people: 'walk', characters: 'walk', zoo: 'walk' };
  const NO_GO = new Set(['sign', 'pal']);
  ITEMS.forEach(d => { if (d.go === undefined && !d.snap && !NO_GO.has(d.id)) { const g = GO_BY_KIND[d.id] || GO_BY_KIT[d.kit]; if (g) d.go = g; } if (d.id === 'pal') d.go = 'walk'; });
  const DEF = Object.fromEntries(ITEMS.map(d => [d.id, d]));

  /* The Job Board: build orders that PAY. Progress counts things by kit; strokes count drawing. One collect per world. */
  const JOBS = [
    { id: 'waterpark', e: '🏊', name: 'Water Park', pay: 15, need: { waterpark: 6 }, how: 'Put 6 water park things in your world' },
    { id: 'lazyriver', e: '🛟', name: 'Lazy River', pay: 12, need: { waterpark: 4, people: 1 }, how: 'Snap 4 river pieces into a loop and put a kid on a tube' },
    { id: 'palparty', e: '🦸', name: 'Pal Party', pay: 8, need: { people: 4 }, how: 'Make or add 4 people or characters. Tap Make a pal to dress one up!' },
    { id: 'garage', e: '🅿️', name: 'Parking Garage', pay: 14, need: { city: 3, vehicles: 6 }, how: 'Stack 3 garage decks (City shelf) and park 6 vehicles' },
    { id: 'tiles', e: '🔷', name: 'Tile Tower', pay: 10, need: { tiles: 8 }, how: 'Snap 8 magnet tiles together' },
    { id: 'river', e: '🌊', name: 'River Designer', pay: 10, river: 1, need: { waterpark: 3 }, how: 'Draw a river with the 🌊 brush, then add 3 water park things' },
    { id: 'themepark', e: '🎢', name: 'Theme Park', pay: 18, need: { themepark: 6 }, how: 'Build 6 theme park rides, tracks, or stands' },
    { id: 'zoo', e: '🦁', name: 'Zoo', pay: 16, need: { zoo: 6 }, how: 'Add 6 zoo things: pens, bars, signs, and animals' },
    { id: 'jungle', e: '🌴', name: 'Jungle', pay: 12, need: { nature: 5, zoo: 2 }, how: '5 nature things plus 2 jungle animals or vines' },
    { id: 'school', e: '🏫', name: 'School', pay: 14, need: { city: 3, people: 3 }, how: '3 city things plus 3 people (a school needs kids!)' },
    { id: 'city', e: '🏙️', name: 'City', pay: 18, need: { city: 5, vehicles: 3 }, how: '5 city things plus 3 vehicles' },
    { id: 'beach', e: '🏖️', name: 'Beach Day', pay: 12, need: { beach: 5 }, how: '5 beach or sea things' },
    { id: 'kingdom', e: '🏰', name: 'Kingdom', pay: 16, need: { castle: 4, people: 2 }, how: '4 castle pieces plus 2 people to rule it' },
    { id: 'station', e: '🛸', name: 'Space Station', pay: 18, need: { space: 5, pieces: 2 }, how: '5 space things plus 2 build parts' },
    { id: 'dreamroom', e: '🛏️', name: 'Dream Room', pay: 10, need: { home: 5 }, how: '5 home things' },
    { id: 'blocks', e: '🧱', name: 'Block Master', pay: 12, need: { blocks: 15 }, how: 'Snap 15 blocks together' },
    { id: 'architect', e: '📐', name: 'Architect', pay: 10, need: { pieces: 8 }, how: 'Use 8 build parts: walls, roofs, floors, fences' },
    { id: 'artist', e: '🎨', name: 'Artist', pay: 5, strokes: 3, how: 'Draw 3 lines on your world' },
    { id: 'neighborhood', e: '🏘️', name: 'Neighborhood', pay: 14, need: { pieces: 6, people: 3, vehicles: 1 }, how: 'Build 6 parts, add 3 people and a car' },
  ];

  window.CB_CATALOG = { KITS, ITEMS, DEF, JOBS };
})();
