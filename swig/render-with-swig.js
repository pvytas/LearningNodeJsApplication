var swig  = require('swig');

let renderedHtml = swig.renderFile('./template.html', {
    pagename: 'awesome people',
    authors: ['Paul', 'Jim', 'Jane']
});

console.log(renderedHtml);


