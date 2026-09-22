import * as T from './vendor/three.module.js';
const mount=new T.Vector3(0,1.04,.54),passengers=new T.Vector3(0,.84,-.30);
// A camera mounted inside the windshield, facing the front seats. Match the
// body's complete transform so a drift cannot move the camera outside the car.
export function interiorDashcam(body,aspect,position,target,up){
 body.updateWorldMatrix(true,false);
 position.copy(mount).applyMatrix4(body.matrixWorld);
 target.copy(passengers).applyMatrix4(body.matrixWorld);
 up.set(0,1,0).transformDirection(body.matrixWorld);
 return 2*T.MathUtils.radToDeg(Math.atan(Math.tan(T.MathUtils.degToRad(110/2))/aspect));
}
