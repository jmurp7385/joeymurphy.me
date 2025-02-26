'use client';

import * as d3 from 'd3';
import { useRef, useEffect, useState } from 'react';

export default function SiteswapSpaceTimeGraph() {
  const [balls, setBalls] = useState(3);
  const [siteswap, setSiteswap] = useState('3');
  const refs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    console.log(
      refs.current.map((ref) => {
        return ref.getBoundingClientRect();
      }),
    );
  }, []);

  return (
    <section>
      <div style={{ display: 'flex' }}>
        {siteswap
          .split('')
          .map(Number)
          .flatMap((value, index, array) => {
            if (array.length === 1) {
              return new Array(value).fill(value);
            } else {
              return value;
            }
          })
          .map((value, index) => {
            return (
              <div
                ref={(ref) => {
                  if (ref) {
                    refs.current[index] = ref;
                  }
                }}
                style={{
                  width: 50,
                  backgroundColor: '#333',
                  margin: 2,
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'column',
                }}
              >
                <p>{value}</p>
                <p>{value % 2 ? 'L' : 'R'}</p>
              </div>
            );
          })}
      </div>
    </section>
  );
}
