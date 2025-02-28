import { Ball } from './SiteswapAnimation';

/* Throw History Visualization */
export function ThrowHistory(props: { history: Ball[]; limit?: number }) {
  const { history, limit = -10 } = props;
  const limitedHistory = history.slice(limit).reverse(); // Show last 'limit' throws (default -10 for last 10)

  return (
    <div style={{ marginTop: '20px', maxWidth: '600px', overflowX: 'auto' }}>
      <h3>Throw History</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody>
          {/* Row for Ball ID */}
          <tr>
            <th
              style={{
                border: '1px solid #ccc',
                padding: '5px',
                textAlign: 'left',
              }}
            >
              Ball ID
            </th>
            {limitedHistory.map((entry, index) => (
              <td
                key={index}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px',
                  textAlign: 'center',
                }}
              >
                {entry.id}
              </td>
            ))}
          </tr>
          {/* Row for Time */}
          <tr>
            <th
              style={{
                border: '1px solid #ccc',
                padding: '5px',
                textAlign: 'left',
              }}
            >
              Time (ms)
            </th>
            {limitedHistory.map((entry, index) => (
              <td
                key={index}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px',
                  textAlign: 'center',
                }}
              >
                {entry.throwTime}
              </td>
            ))}
          </tr>
          {/* Row for Hand */}
          <tr>
            <th
              style={{
                border: '1px solid #ccc',
                padding: '5px',
                textAlign: 'left',
              }}
            >
              Hand
            </th>
            {limitedHistory.map((entry, index) => (
              <td
                key={index}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px',
                  textAlign: 'center',
                }}
              >
                {entry.fromLeft ? 'Left' : 'Right'}
              </td>
            ))}
          </tr>
          {/* Row for Throw Value */}
          <tr>
            <th
              style={{
                border: '1px solid #ccc',
                padding: '5px',
                textAlign: 'left',
              }}
            >
              Throw Value
            </th>
            {limitedHistory.map((entry, index) => (
              <td
                key={index}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px',
                  textAlign: 'center',
                }}
              >
                {entry.currentThrow}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
