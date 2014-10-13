# MicroXHR: a very small JavaScript XHR library
MicroXHR is a very small (828 bytes gzipped) library that handles AJAX request in a similar fashion as jQuery.

# Usage
## Basic usage
``` javascript
new Ajax('/path/to/something.txt')
    .done(function (data, status, xhr) {
        console.log('Request succeeded', data, status, xhr);
        document.getElementById('target').innerHTML = data;
    })
    .always(function (xhr, status) {
        console.log('always called', xhr, status);
    })
    .fail(function (xhr, status, error) {
        console.log('An error has occurred', status, error);
    });
```

## Working with JSON
``` javascript
new Ajax('/path/to/data.json')
    .done(function (data, status, xhr) {
        console.log('Request succeeded', data);
        document.getElementById('target').innerHTML = data;
    }, 'json')
    .always(function (xhr, status) {
        console.log('always called', xhr, status);
    })
    .fail(function (xhr, status, error) {
        console.log('An error has occurred', status, error);
    });
```
