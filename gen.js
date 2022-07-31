const fs = require('fs');
const less = require('less');
const defaultVars = require('antd/dist/default-theme');
const darkVars = require('antd/dist/dark-theme');

const genLess = (myModifyVars, filename) => {
  const proLess = Object.keys(myModifyVars)
    .map((key) => {
      return `${key}: ${myModifyVars[key]};`;
    })
    .join('\n');

  less
    .render(
      `@import './color/bezierEasing';
@import './color/colorPalette';
@import "./color/tinyColor";
body {${proLess}}`,
      {
        modifyVars: myModifyVars,
        javascriptEnabled: true,
        filename: 'antd.less',
      }
    ) // 如果需要压缩，再打开压缩功能默认打开
    .then((out) => out.css)
    .then((css) => {
      const lessObj = css
        .split('\n')
        .filter((line) => {
          if (line.includes('body')) {
            return false;
          }
          if (line.includes('}')) {
            return false;
          }
          if (line.includes('{')) {
            return false;
          }
          if (line.includes('/*')) {
            return false;
          }
          if (line.includes('hack_less')) {
            return false;
          }
          return true;
        })
        .map((line) => line.trim())
        .map((line) => {
          const [key, value] = line.split(':');
          if (!value) return null;
          return { key, value: value?.trim()?.replace(';', '') };
        })
        .filter(Boolean)
        .reduce((acc, val) => {
          acc[val.key] = val.value;
          return {
            ...acc,
          };
        }, {});

      fs.writeFileSync(
        `dist/${filename}.js`,
        `module.exports = ${JSON.stringify(lessObj)};`
      );
    })
    .catch((e) => {
      console.log(e);
    });
};

genLess(defaultVars, 'default-theme');
genLess(darkVars, 'dark-theme');
