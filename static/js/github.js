var github = (function () {
  function escapeHtml(str) {
    var newDiv = document.createElement('div');
    newDiv.innerHTML = str;
    return newDiv.outerHTML;
  }

  function render(target, repos) {
    var i = 0,
      fragment = '',
      t = document.querySelector(target);

    fragment += '<ul class="list-group" id="github">';

    for (i = 0; i < repos.length; i++) {
      fragment +=
        '<li class="list-group-item"><a href="' +
        repos[i].html_url +
        '">' +
        repos[i].name +
        '</a><p><small>' +
        escapeHtml(repos[i].description || '') +
        '</small></p></li>';
    }
    fragment += '</ul>';
    t.innerHTML = fragment;
  }

  function onError(error, options) {
    var loadingElement = document.querySelector(`${options.target} .loading`);
    loadingElement.classList.add('error');
    loadingElement.innerText = 'There was an issue loading the repo list.';
    loadingElement.classList.remove('loading');
  }

  function onSuccess(data, options) {
    var repos = [];

    if (!data) {
      return;
    }

    for (var i = 0; i < data.length; i++) {
      if (options.skip_forks && data.data[i].fork) {
        continue;
      }

      repos.push(data[i]);
    }

    repos.sort(function (a, b) {
      var aDate = new Date(a.pushed_at).valueOf(),
        bDate = new Date(b.pushed_at).valueOf();

      if (aDate === bDate) {
        return 0;
      }

      return aDate > bDate ? -1 : 1;
    });

    if (options.count) {
      repos.splice(options.count);
    }

    render(options.target, repos);
  }

  return {
    showRepos: function (options) {
      fetch(`https://api.github.com/users/${options.user}/repos`)
        .then((response) => response.json())
        .then(function (data) {
          onSuccess(data, options);
        })
        .catch(function (error) {
          onError(error, options);
        });
    },
  };
})();
