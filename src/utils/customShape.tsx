import { Sector } from 'recharts';

export const CustomShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius - 5) * cos;
  const sy = cy + (outerRadius - 5) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 60;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <circle cx={sx} cy={sy} r={2} fill="#797979" stroke="none" />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="#797979" fill="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * -30} y={ey - 5} textAnchor={textAnchor} fill="#FFFFFF">{payload.name}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * -30} y={ey} dy={18} textAnchor={textAnchor} fill="#48494B">
        {`${payload.value}%`}
      </text>
    </g>
  );
};