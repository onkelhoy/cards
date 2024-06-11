import { Vector } from "vector";
/**
 * 
 * @param {vector} p 
 * @param {vector[]} triangle 
 */
export function isPointInTriangle(p, ...triangle) {
  if (triangle.length !== 3) throw new Error(`${triangle} is not a triangle`);

  if (!pointintriangle_helper(p, triangle, 0)) return false; // a -> p
  if (!pointintriangle_helper(p, triangle, 1)) return false; // b -> p
  if (!pointintriangle_helper(p, triangle, 2)) return false; // c -> p

  return true;
}

function pointintriangle_helper(p, triangle, index) {
  const ab = Vector.Subtract(triangle[(index + 1) % triangle.length], triangle[index]); // b - a 
  const ap = Vector.Subtract(p, triangle[index]); // p - a 

  return Vector.Cross(ab, ap) >= 0;
}

/**
 * 
 * @param {Rectangle} a 
 * @param {Rectangle} b 
 * @returns boolean|rectangle
 */
export function AABB(a, b) {
  const x = AABBhelper(a, b, 'x');
  if (x === false) return false;

  const y = AABBhelper(a, b, 'y');
  if (y === false) return false
  
  return {...x, ...y};
} 
const aabb_map = {x: 'w', y: 'h'};
function AABBhelper(a, b, type = "x") {
  const min = Math.min(a[type], b[type]);
  const max = Math.max(a[type] + a[aabb_map[type]], b[type] + b[aabb_map[type]]);
  
  const global = a[aabb_map[type]] + b[aabb_map[type]];
  const local = max - min;
  if (local <= global)
  {
    return { [type]: Math.max(a[type], b[type]), [aabb_map[type]]: global - local };
  }

  return false;
}

/**
 * 
 * @param {Vector} p 
 * @param {Rectangle} rec 
 * @returns boolean
 */
export function isPointInRectangle(p, rec) {
  return p.x >= rec.x && p.x <= rec.x + rec.w && p.y >= rec.y && p.y <= rec.y + rec.h;
}

/**
 * 
 * @param {Circle} a 
 * @param {Circle} b 
 * @returns boolean|Circle
 */
export function CircleIntersection(a, b) {
  const dv = Vector.Subtract(b, a);
  const d = dv.magnitude;

  if (d <= a.r + b.r) 
  {
    const r = (a.r + b.r - d) / 2;
    const arp = a.r ** 2;

    const aa = (arp - b.r ** 2 + d ** 2) / (2 * d);
    const h = Math.sqrt(arp - aa ** 2);

    const vc =  a.Add({x: aa * dv.x / d, y: aa * dv.y / d});
    const va = vc.Add({x:  h * dv.y / d, y: -h * dv.x / d});
    const vb = vc.Add({x: -h * dv.y / d, y:  h * dv.x / d});

    return {
      va: va,
      vb: vb,
      vc: vc,
      r,
      a: aa,
      h,
    }
  }

  return false;
}

/**
 * 
 * @param {Vector} p
 * @param {Circle} a 
 * @returns boolean
 */
export function isPointInCircle(p, a) {
  return Vector.Distance(p, a) <= a.r;
}

/**
 * 
 * @param {Vector} p1 
 * @param {Vector} p2 
 * @param {Vector} p3 
 * @param {Vector} p4 
 * @returns false|Vector
 */
export function LineIntersection(p1, p2, p3, p4) {
  const D1 = Vector.Subtract(p2, p1);
  const D2 = Vector.Subtract(p4, p3);
  
  const denominator = Vector.Cross(D1, D2);
  if (denominator === 0) return false;
  
  const D3 = Vector.Subtract(p3, p1);
  const t = Vector.Cross(D3, D2) / denominator;
  const u = Vector.Cross(D3, D1) / denominator;

  return {
    x: p1.x + t * D1.x,
    y: p1.y + t * D1.y,
    t,
    u,
  };
}
/**
 * 
 * @param {Vector} p1 
 * @param {Vector} p2 
 * @param {Vector} p3 
 * @param {Vector} p4 
 * @returns false|Vector
 */
export function SegmentIntersection(p1, p2, p3, p4) {

  const i = LineIntersection(p1, p2, p3, p4);
  if (i === false) return false;
  
  if (i.t >= 0 && i.t <= 1 && i.u >= 0 && i.u <= 1)
  {
    return i;
  }

  return false;
}

export function isPointInPolygonTriangles(point, polygon) {
  for (let i=0; i<polygon.triangles.length; i+=3)
  {
    const a = polygon.verticies[polygon.triangles[i]];
    const b = polygon.verticies[polygon.triangles[i+1]];
    const c = polygon.verticies[polygon.triangles[i+2]];

    if (isPointInTriangle(point, a, b, c))
    {
      return [true, [a,b,c]];
    }
  }
  
  // const triangles = polygon.getTriangles();

  // for (const triangle of triangles) 
  // {
  //   if (isPointInTriangle(point, ...triangle))
  //   {
  //     return [true, triangle];
  //   }
  // }

  return false;
}

export function isPointInPolygonRayCasting(point, polygon) {
  const ray = [point, point.Add(10000, 0)];
  let intersections = 0;
  for (let i=0; i<polygon.verticies.length; i++) 
  {
    const a = polygon.verticies[i];
    const b = polygon.verticies[(i + 1) % polygon.verticies.length];

    if (SegmentIntersection(ray[0], ray[1], a, b))
    {
      intersections++;
    }
  }

  return intersections % 2 === 1;
}

// /**
//  * Seperate Axis Theorem : SAT 
//  * @param {Polygon} a 
//  * @param {Polygon} b 
//  */
// export function SAT(a, b) {
//   if (!AABB(a.boundary, b.boundary)) return false;
  
//   const direction = a.center.sub(b.center);

//   return sat_algorithm(a, b, direction);
// }
// function sat_algorithm(a, b, direction) 
// {
//   const ainfo = sat_helper(a, b);
//   if (!ainfo) return false;

//   const binfo = sat_helper(b, a);
//   if (!binfo) return false;

//   let target = binfo;
//   if (ainfo.depth < binfo.depth)
//   {
//     target = ainfo;
//   }

//   const normalmag = target.axis.magnitude;
//   const normal = target.axis.normalise();

//   if (direction.dot(normal) > 0)
//   {
//     normal.mul(-1); // flip
//   }

//   return {
//     depth: target.depth / normalmag,
//     normal,
//   }
// }
// function sat_helper(a, b) {
//   let depth = Number.MAX_SAFE_INTEGER;
//   let axis = Vector.Zero;

//   for (let i=0; i<a.verticies.length; i++) 
//   {
//     const localaxis = Vector.Perpendicular(a.verticies[i], a.verticies[(i+1) % a.verticies.length]).normalise();
    
//     const [mina, maxa] = sat_project(a.verticies, localaxis);
//     const [minb, maxb] = sat_project(b.verticies, localaxis);

//     if (mina >= maxb || minb >= maxa) return false;

//     const localdepth = Math.min(maxb - mina, maxa - minb);
//     if (localdepth < depth)
//     {
//       depth = localdepth;
//       axis = localaxis;
//     }
//   }

//   return {axis, depth};
// }
// function sat_project(verticies, axis) {
//   let min = Number.MAX_SAFE_INTEGER;
//   let max = Number.MIN_SAFE_INTEGER;
//   for (const v of verticies) 
//   {
//     const projection = v.dot(axis);
//     if (projection < min) min = projection;
//     if (projection > max) max = projection;
//   }

//   return [min, max];
// }

// export function genericSAT(a, b) {
//   if (!(a.boundary && b.boundary && AABB(a.boundary, b.boundary)))
//   {
//     return false;
//   }

//   /// check which method should be applied to both a or b 
//   /// pending on if they have concave or not 
// }


// /**
//  * (T) triangle SAT : TSAT 
//  * @param {Polygon} a 
//  * @param {Polygon} b 
//  * @returns 
//  */
// export function TSAT(a, b) 
// {
//   if (!AABB(a.boundary, b.boundary)) return false;
//   const direction = a.center.sub(b.center);

//   // first for a
//   const ainfo = tsat_helper(a, b, direction)
//   if (ainfo)
//   {
//     return ainfo;
//   }
//   const binfo = tsat_helper(a, b, direction);
//   if (binfo)
//   {
//     return binfo;
//   }

//   return false;
// }

// function tsat_helper(a, b, direction) {
//   const ta = {verticies:[]};
//   const tb = {verticies:[]};

//   for (let i=0; i<a.triangles.length/3; i++)
//   {
//     ta.verticies = a.getTriangle(i);

//     for (let j=0; j<b.triangles.length/3; j++)
//     {
//       tb.verticies = b.getTriangle(j);

//       if (sat_algorithm(ta, tb, direction))
//       {
//         return true;
//       }
//     }
//   }
// }

/**
 * Seperate Axis Theorem : SAT 
 * @param {Polygon} a 
 * @param {Polygon} b 
 */
export function SAT(a, b) {
  if (!AABB(a.boundary, b.boundary)) return false;
  
  const direction = a.center.sub(b.center);

  if (a.concave)
  {
    if (b.concave)
    {
      return sat_concave_concave(a, b, direction);
    }
    else 
    {
      return sat_concave_convex(a, b, direction);
    }
  }
  else if (b.concave)
  {
    return sat_concave_convex(b, a, direction);
  }

  return sat_convex_convex(a, b, direction);
}

//#region SAT convex convex
function sat_convex_convex(a, b, direction) 
{
  const ainfo = sat_helper(a, b);
  if (!ainfo) return false;

  const binfo = sat_helper(b, a);
  if (!binfo) return false;

  let target = binfo;
  if (ainfo.depth < binfo.depth)
  {
    target = ainfo;
  }

  const normalmag = target.axis.magnitude;
  const normal = target.axis.normalise();

  if (direction.dot(normal) > 0)
  {
    normal.mul(-1); // flip
  }

  return {
    depth: target.depth / normalmag,
    normal,
  }
}
function sat_helper(a, b) {
  let depth = Number.MAX_SAFE_INTEGER;
  let axis = Vector.Zero;

  for (let i=0; i<a.verticies.length; i++) 
  {
    const localaxis = Vector.Perpendicular(a.verticies[i], a.verticies[(i+1) % a.verticies.length]).normalise();
    
    const [mina, maxa] = sat_project(a.verticies, localaxis);
    const [minb, maxb] = sat_project(b.verticies, localaxis);

    if (mina >= maxb || minb >= maxa) return false;

    const localdepth = Math.min(maxb - mina, maxa - minb);
    if (localdepth < depth)
    {
      depth = localdepth;
      axis = localaxis;
    }
  }

  return {axis, depth};
}
function sat_project(verticies, axis) {
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  for (const v of verticies) 
  {
    const projection = v.dot(axis);
    if (projection < min) min = projection;
    if (projection > max) max = projection;
  }

  return [min, max];
}
//#endregion

//#region SAT concave convex
function sat_concave_convex(a, b, direction)
{
  const ta = {verticies:[]};

  for (let i=0; i<a.triangles.length/3; i++)
  {
    ta.verticies = a.getTriangle(i);

    const intersectioninfo = sat_convex_convex(ta, b, direction);
    if (intersectioninfo)
    {
      return intersectioninfo;
    }
  }
}
//#endregion

//#region SAT concave concave
function sat_concave_concave(a, b, direction)
{
  const ta = {verticies:[]};
  const tb = {verticies:[]};

  for (let i=0; i<a.triangles.length/3; i++)
  {
    ta.verticies = a.getTriangle(i);

    for (let j=0; j<b.triangles.length/3; j++)
    {
      tb.verticies = b.getTriangle(j);

      const intersectioninfo = sat_convex_convex(ta, tb, direction);
      if (intersectioninfo)
      {
        return intersectioninfo;
      }
    }
  }
}
//#endregion

function GJK(a, b) {
  let direction = Vector.Random; // start b

  let simplex = []; // triangle 
  let oldsimplex = [];
  const CSO = {}; // configuration space obstacle
  while (gjk_notsamesimplex(simplex, oldsimplex))
  {
    const pa = gjk_getpoint(a, direction);
    const pb = gjk_getpoint(b, direction.Opposite);

    const point = pa.Sub(pb);
    
  }
}

function gjk_notsamesimplex(a, b)
{
  if (a.length === 0) return true;
  if (a.length !== b.length) return true;
  for (let i=0; i<a.length; i++)
  {
    if (a[i].toString() !== b[i].toString()) return true;
  }

  return false; // its the same
}

/**
 * Get's the support point to build the CSO
 * @param {Shape} shape 
 * @param {Vector} direction 
 * @returns {Vector} support-point
 */
function gjk_supportppoint(shape, direction) {
  if (shape.supportFunction) 
  {
    return shape.supportFunction(direction);
  }
}