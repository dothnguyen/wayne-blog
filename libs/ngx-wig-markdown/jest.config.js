module.exports = {
  name: 'ngx-wig-markdown',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/ngx-wig-markdown',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
