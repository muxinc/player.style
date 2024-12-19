'use client';

import React from 'react';
import ThemeElement from './media-theme.js';
// keep as last import, ce-la-react is bundled.
import { createComponent } from 'ce-la-react';

export default createComponent({
  react: React,
  tagName: '{{{element_name}}}',
  elementClass: ThemeElement,
});
