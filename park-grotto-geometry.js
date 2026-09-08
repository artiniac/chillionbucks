import * as T from './vendor/three.module.js';
export const GROTTO_Z=-70;
export function parkGroundGeometry(){
 const shape=new T.Shape();shape.moveTo(-90,-90);shape.lineTo(90,-90);shape.lineTo(90,100);shape.lineTo(-90,100);shape.closePath();
 const pool=new T.Path();pool.moveTo(-7,-GROTTO_Z-13);pool.lineTo(-7,-GROTTO_Z+13);pool.lineTo(7,-GROTTO_Z+13);pool.lineTo(7,-GROTTO_Z-13);pool.closePath();shape.holes.push(pool);
 return new T.ShapeGeometry(shape).rotateX(-Math.PI/2);
}
export function canWalkParkExtension(x,z){
 if(z>=-44)return Math.abs(x)<=44&&z<=44;
 if(z< -94||Math.abs(x)>22)return false;
 const local=z-GROTTO_Z;
 if(Math.abs(x)<7.35&&Math.abs(local)<13.35)return false;
 if(x> -13.1&&x< -4.9&&local>16.8&&local<21.2)return false;
 return true;
}
