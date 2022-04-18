/* eslint-disable import/no-extraneous-dependencies */
import { html, render } from 'htm/preact/standalone.module';
import { Bet } from '../../dist/core';

function App(_props) {
  return html`
    <h1>
      <a href="http://github.com/LeonardoVal/ludorum.js" target="_blank">Ludorum</a> tester
    </h1>
    <p>${Bet.name}</p>
  `;
}

render(html`<${App} />`, document.querySelector('#app'));
