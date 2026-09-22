// A grouped teaching sequence, not workshop torque specifications or a service manual.
const step=(id,name,chapter,quantity,lesson,detail,art)=>({id,name,chapter,quantity,lesson,detail,art});
export const ENGINE_STEPS=[
 step('block','Engine block','Bottom end',1,'Six cylinders, one strong home.','The block holds the cylinders, crankshaft bearings, oil passages, and cooling passages.'),
 step('bearings','Main bearings','Bottom end',7,'Smooth shells help the crank spin.','Seven pairs of thin bearing shells support the crankshaft. An oil film keeps moving metal surfaces apart.'),
 step('crank','Crankshaft','Bottom end',1,'Up and down becomes round and round.','Offset crankpins turn the push of the connecting rods into rotation.'),
 step('caps','Main bearing caps','Bottom end',7,'Hold the crankshaft in place.','The caps bolt to the block. The crankshaft still spins inside its lubricated bearings.'),
 ...Array.from({length:6},(_,i)=>step('piston'+i,'Piston '+(i+1)+' + connecting rod','Pistons',1,'Slide the piston into cylinder '+(i+1)+'.','Each assembly has a piston, three rings, a wrist pin, and a connecting rod. Rings seal pressure and control oil; the wrist pin joins the piston to the rod.','piston')),
 step('rodCaps','Rod caps + bearings','Bottom end',6,'Connect every rod to the crank.','The big end of each rod surrounds a crankpin. Bearing shells, caps, and bolts complete that connection.'),
 step('oilPump','Oil pump','Lubrication',1,'Send oil to the moving parts.','The crankshaft drives this pump. Oil travels from the sump through the pickup and filter to bearings and other moving parts.'),
 step('pickup','Oil pickup','Lubrication',1,'Collect oil from the bottom.','A screened pickup draws oil out of the sump and into the pump.'),
 step('sump','Oil pan + gasket','Lubrication',1,'Keep the oil in its own tank.','The sump stores oil below the crankshaft. Its gasket seals the joint with the block.'),
 step('rearSeal','Rear seal + flywheel','Bottom end',1,'Carry the turning power onward.','A rear seal helps keep oil inside. The flywheel smooths rotation and connects to the clutch and transmission.'),
 step('gasket','Head gasket','Cylinder head',1,'Seal the block to the head.','This thin gasket seals combustion pressure, oil, and coolant between the block and cylinder head.'),
 step('head','Cylinder head','Cylinder head',1,'Give each cylinder a roof.','The head contains combustion chambers, intake ports, exhaust ports, and the valve gear.'),
 step('intakeValves','Intake valves','Valve train',12,'Let air and fuel in.','Two intake valves per cylinder open to admit the mixture, then close to seal the chamber.'),
 step('exhaustValves','Exhaust valves','Valve train',12,'Let used gas out.','Two exhaust valves per cylinder release exhaust gas after the power stroke.'),
 step('springs','Valve springs + retainers','Valve train',24,'Spring the valves closed.','Each spring returns a valve to its seat. Retainers and small keepers hold the spring assembly together.'),
 step('tappets','Bucket tappets','Valve train',24,'Pass the cam movement to the valves.','Cam lobes press these buckets to open the valves. The springs close the valves as the lobes turn away.'),
 step('intakeCam','Intake camshaft','Valve train',1,'Open the intake valves at the right time.','One overhead camshaft operates the intake valves. It turns once for every two turns of the crankshaft.'),
 step('exhaustCam','Exhaust camshaft','Valve train',1,'Time the exhaust valves too.','The second overhead camshaft operates the exhaust valves. Together these are dual overhead cams, or DOHC.'),
 step('camCaps','Cam bearing caps','Valve train',14,'Keep both cams in place.','The caps hold the camshafts in the head while allowing them to rotate.'),
 step('timing','Timing gears + belt','Timing',1,'Keep the top and bottom in time.','A toothed belt connects the crankshaft to both camshafts. The cam gears have twice as many teeth as the crank gear.'),
 step('plugs','Spark plugs','Ignition',6,'Make a tiny spark in each cylinder.','A spark starts combustion in the compressed mixture. This engine has one spark plug per cylinder.'),
 step('coils','Ignition coils','Ignition',6,'Give the plugs their spark energy.','The coils supply the high voltage needed to create sparks at the spark plugs.'),
 step('covers','Cam covers + seals','Cylinder head',2,'Cover the moving valve gear.','The two covers and their seals keep lubricating oil inside. Use See inside to uncover the moving parts again.'),
 step('intake','Intake runners + throttles','Air + fuel',6,'Share the air between six cylinders.','Six runners carry air from the plenum to the intake ports. Throttle valves regulate airflow.'),
 step('injectors','Fuel injectors + rail','Air + fuel',6,'Add fuel before the intake valves.','The fuel rail supplies six port injectors. Each sprays fuel into its intake port, outside the combustion chamber.'),
 step('manifold','Exhaust manifolds','Turbo system',2,'Collect the exhaust energy.','Each manifold collects exhaust from three cylinders and guides it toward one turbocharger.'),
 step('turbos','Twin turbochargers','Turbo system',2,'Exhaust spins a wheel that pumps air.','Each turbo has a turbine and a compressor joined by a shaft. Exhaust powers the turbine; the compressor pressurizes fresh air.','turbo'),
 step('charge','Intercooler + charge pipes','Turbo system',1,'Cool the compressed air.','Compressed air passes through an intercooler before reaching the intake. The pipes connect the compressor outlets, cooler, and plenum.'),
 step('filters','Air filters + inlet pipes','Turbo system',2,'Give the engine clean air.','Filters keep dirt out of the compressor inlets. Wastegate controls help limit turbo boost.','turbo'),
 step('waterPump','Water pump + thermostat','Cooling',1,'Move coolant around the engine.','A water pump circulates coolant. The thermostat controls flow to the radiator as the engine warms.'),
 step('radiator','Radiator + coolant hoses','Cooling',1,'Carry extra heat away.','Coolant transports heat to the radiator. Air flowing through its fins carries that heat away.'),
 step('alternator','Alternator','Accessories',1,'Make electricity while the engine runs.','The alternator generates electricity for the car and charges its battery.'),
 step('starter','Starter motor','Accessories',1,'Start the first turn.','The battery powers this motor. Its small gear turns the flywheel to begin cranking the engine.'),
 step('oilFilter','Oil filter + dipstick','Lubrication',1,'Keep oil clean and check its level.','The filter traps particles. The dipstick lets a grown-up check the oil level with the engine stopped.'),
 step('wiring','Engine computer + wiring','Controls',1,'Connect the engine team.','The ECU uses sensor information to control fuel and spark. Wires connect the injectors, coils, and sensors.'),
 step('accessory','Accessory pulleys + belts','Accessories',1,'Drive the pump and alternator.','These belts turn accessories from the crankshaft pulley. The separate toothed timing belt keeps the valves in time.'),
];
export const FIRING_ORDER=[0,4,2,5,1,3];
export function cylinderState(theta,index){
 const phase=FIRING_ORDER.indexOf(index)*Math.PI*2/3;
 const cycle=((theta-phase)%(Math.PI*4)+Math.PI*4)%(Math.PI*4);
 const crankX=.23*Math.sin(theta-phase),crankY=.23*Math.cos(theta-phase);
 const pistonY=.66+crankY+Math.sqrt(.70**2-crankX**2);
 const stroke=Math.floor(cycle/Math.PI);
 return {crankX,crankY,pistonY,cycle,stroke,intake:stroke===2?Math.sin(cycle%Math.PI)*.095:0,exhaust:stroke===1?Math.sin(cycle%Math.PI)*.095:0,spark:cycle<.20};
}
export function engineSaveKey(project){return 'cb:engine-workshop:v1:'+encodeURIComponent(project||'first-town');}
export function readEngineProgress(storage,project){
 const raw=storage.getItem(engineSaveKey(project));if(!raw)return {v:1,step:0};
 const p=JSON.parse(raw);if(p.v!==1||!Number.isInteger(p.step)||p.step<0||p.step>ENGINE_STEPS.length)throw Error('This engine save could not be read. Your saved work has not been replaced.');
 return {v:1,step:p.step};
}
export function writeEngineProgress(storage,project,step){
 if(!Number.isInteger(step)||step<0||step>ENGINE_STEPS.length)throw Error('Invalid engine stage');
 storage.setItem(engineSaveKey(project),JSON.stringify({v:1,step}));
}
