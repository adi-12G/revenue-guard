type Props = {
  data: any[];
};

export default function LeakageTable({
  data,
}: Props) {
  if (!data.length) return null;

  const isDetectorResult =
  !!data[0]?.leakType;

  return (
    <table className="w-full border mt-6">
      <thead>
        <tr className="border-b">
          <th className="p-2">Customer</th>

          {isDetectorResult ? (
            <>
              <th className="p-2">
                Leak Type
              </th>

              <th className="p-2">
                Revenue Loss
              </th>
            </>
          ) : (
            <>
              <th className="p-2">
                Expected
              </th>

              <th className="p-2">
                Billed
              </th>

              <th className="p-2">
                Loss
              </th>

              <th className="p-2">
                Status
              </th>
            </>
          )}
        </tr>
      </thead>

      <tbody>
        {data.map((row, index) => (
          <tr
            key={index}
            className="border-b"
          >
            <td className="p-2">
              {row.customer}
            </td>

            {isDetectorResult ? (
              <>
                <td className="p-2">
                  {row.leakType}
                </td>

                <td className="p-2">
                  ₹{row.loss}
                </td>
              </>
            ) : (
              <>
                <td className="p-2">
                  ₹{row.expected}
                </td>

                <td className="p-2">
                  ₹{row.billed}
                </td>

                <td className="p-2">
                  ₹{row.loss}
                </td>

                <td className="p-2">
                  {row.status}
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
