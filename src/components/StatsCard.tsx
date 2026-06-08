type Props = {
  title: string;
  value: string | number;
};

export default function StatsCard({ title, value }: Props) {
    
  return (
    <div className="border rounded-lg p-4 shadow">
      <h3 className="text-gray-500 text-sm">
        {title}
      </h3>

      <p className="text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}