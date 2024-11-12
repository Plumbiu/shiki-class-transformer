# shiki-class-transformer

transfrom [`shiki`](https://github.com/shikijs/shiki/tree/main/packages) inline styles to classes.

# usage

add `shikiClassTransformer` to shiki's `transformers` options

```jsx
import { shikiClassTransformer } from 'shiki-class-transformer'
// vitesse-light.json is equal to vitesse-dark.json
import shikiMap from 'shiki-class-transformer/themes/vitesse-light.json'
// import shikiMap from 'shiki-class-transformer/themes/vitesse-dark.json'
import { codeToHtml } from 'shiki'

const html = await codeToHtml(`console.log('hello')`, {
  lang: 'ts',
  theme: 'vitesse-light',
  transformers: [
    shikiClassTransformer({ map: shikiMap }),
    // ...
  ],
})
```

then, import `css` file:

```js
import 'shiki-class-transformer/themes/vitesse-light.css'
```

> [!NOTE]
> If your have different themes, like `'dark'` of `'light'`, please copy [file](/src/themes/) to your project manually.

# Future

- [ ] test
- [ ] custom prefix
