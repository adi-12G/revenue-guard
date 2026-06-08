type Props = {
  data: any[];
};

export default function FindingsTable({
  data,
}: Props) {
  return (
    <table className="w-full border mt-6">
      <thead>
        <tr className="border-b">
          <th className="p-3 text-left">
            Customer
          </th>

          <th className="p-3 text-left">
            Leak Type
          </th>

          <th className="p-3 text-right">
            Revenue Loss
          </th>
        </tr>
      </thead>

      <tbody>
        {data.map((row, index) => (
          <tr
            key={index}
            className="border-b"
          >
            <td className="p-3">
              {row.customer}
            </td>

            <td className="p-3">
              {row.leak_type}
            </td>

            <td className="p-3 text-right">
              ₹{row.revenue_loss}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
