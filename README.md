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
> If your have different themes, such as `'dark'` and `'light'`, please copy [file](/src/themes/) to your project manually.

# Theme Colors Manipulation

If you use shikis's [`Theme Colors Manipulation`](https://shiki.style/guide/theme-colors), the style in html may be:

```html
<span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;" />
```

config the `keys`:

```js
import { shikiClassTransformer } from 'shiki-class-transformer'
import shikiMap from 'shiki-class-transformer/themes/vitesse-light.json'
shikiClassTransformer({
  map: shikiMap,
  keys: ['--shiki-light'], // vitesse-dark.json is ['--shiki-dark']
  keydeletedKeys: ['--shiki-dark'], // vitesse-dark.json is ['--shiki-light']
}),
```

# Future

- [x] test
- [ ] custom prefix
