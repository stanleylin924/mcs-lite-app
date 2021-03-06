import React from 'react';
import { pure } from 'recompose';
import { DataChannelAdapter } from 'mcs-lite-ui';

const DisplayGPIOLayout = ({
  value,
  id,
}) => (
  <DataChannelAdapter
    dataChannelProps={{
      id,
      type: 'GPIO_DISPLAY',
      values: { value },
    }}
  />
);

export default pure(DisplayGPIOLayout);
