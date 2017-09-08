import { htmlRenderer } from "../../htmlrenderer";

let renderer, _data, _nav;
window.addEventListener("hashchange", handleHashChange, false);
window.addEventListener("dataready", handleDataReady, false);
fetchAndRender(true);

function handleDataReady(event) {
  const response = event.data;
  render(response.data, { page: response.page, param: response.param });
}

function handleHashChange() {
  fetchAndRender();
}


function fetchAndRender(initial = false) {
  const { url, page, param } = window['__iv__route']();
  if (initial) {
    render(null, { page, param });
  } else {
    window['__iv__fetchData']().then((response) => {
      render(response.data, { page: response.page, param: response.param });
    })
  }
}

function render(data, nav) {
  if (!renderer) {
    renderer = htmlRenderer(document.getElementById("root"), hnpwa);
  }
  _data = data;
  _nav = nav;
  renderer.refresh({ data: data, nav: nav });
  window.scrollTo(0, 0);
}

function refresh() {
  renderer.refresh({ data: _data, nav: _nav });
}

function hnpwa(data, nav) {
  `---
  <c:header [page]=nav.page />
  <c:content [data]=data [nav]=nav />
  ---`
}

function header(page) {
  `---
  <header a:class="header">
    <nav a:class="inner">
      <a href="#" a:class="logo">IV</a>
      <a href="#top" [a:class]=(page==='#top'?'router-link-active':'')>Top</a>
      <a href="#new" [a:class]=(page==='#new'?'router-link-active':'')>New</a>
      <a href="#show" [a:class]=(page==='#show'?'router-link-active':'')>Show</a>
      <a href="#ask" [a:class]=(page==='#ask'?'router-link-active':'')>Ask</a>
      <a href="#job" [a:class]=(page==='#job'?'router-link-active':'')>Jobs</a>
      <a href="https://github.com/b-laporte/iv" rel="noopener" a:class="github">Built with IV</a>
    </nav>
  </header>
  ---`
}

function content(data, nav) {
  `---
  <div a:class="view">
    % if (data) {
      % if (data.error) {
          Unable to fetch data, you might be offline
      % } else if (nav.page === '#user') {
          <c:user [data]=data [nav]=nav />
      % } else if (nav.page === '#item') {
          <c:item [data]=data [nav]=nav />
      % } else if (data) {
          <c:newsList [data]=data [nav]=nav />
      % }
    % }
  </div>
  ---`
}

function newsList(data, nav) {
  `---
  <div a:class="news-list">
    <ul>
        % for (let i =0; i < data.length; i++) {
            % const item = data[i];
            <li a:class="news-item">
                <span a:class="score">{{item.points || 0}}</span>
                <span a:class="title">
                    <a href=item.url rel="noopener">{{item.title}}</a>({{item.domain}})
                </span>
                <span a:class="meta">
                    % if (item.type != 'job') {
                        by <a href=("#user/"+item.user)>{{item.user}}</a>
                    % }
                    {{' ' + item.time_ago}}
                    % if (item.type != 'job') {
                         | <a href=("#item/"+item.id)>{{item.comments_count}} comments</a>
                    % }
                </span>
            </li>
        % }
    </ul>
  </div>
  % if (data.length === 30) {
    <a a:class="news-list-more" [href]=(nav.page+"/"+(parseInt(nav.param)+1))>More ...</a>
  % }
  ---`
}

function user(data, nav) {
  `---
  <div a:class="user-view view">
    <h1>User : {{data.id}}</h1>
    <ul a:class="meta">
        <li><span a:class="label">Created:</span> {{' ' + data.created}}</li>
        <li><span a:class="label">Karma:</span> {{' ' +data.karma}}</li>
    </ul>
    <p a:class="links">
        <a [href]=('https://news.ycombinator.com/submitted?id='+data.id)>submissions</a> |
        <a [href]=('https://news.ycombinator.com/threads?id='+data.id)>comments</a>
    </p>
  </div>
  ---`
}

function item(data, nav) {
  `---
  <div a:class="item-view view">
    <div a:class="item-view-header">
        <a [href]=data.url>
            <h1>{{data.title}}</h1>
        </a>
        <span a:class="host"> ({{data.domain}})</span>
        <p a:class="meta">{{data.points}} points | by <a [href]=('#user/'+data.user) a:class="">{{data.user}}</a>{{' ' + data.time_ago}}</p>
    </div>
    <div a:class="item-view-comments">
        <p a:class="item-view-comments-header">
        {{data.comments_count}} comments
        </p>
        <c:commentList [comments]=data.comments />
    </div>
  </div>
  ---`
}

function commentList(comments) {
  `---
  <ul a:class="comment-children">
    % for (let i = 0; i < comments.length; i++) {
        % const comment = comments[i];
        <c:commentItem [comment]=comment />
    % }
  </ul>
  ---`
}

function commentItem(comment) {
  `---
  <li a:class="comment">
      <div a:class="by"><a [href]=('#user/'+comment.user) a:class="">{{comment.user}}</a>{{' ' + comment.time_ago}}</div>
      <div a:class="text" innerHTML=comment.content />
      % if (comment.comments && comment.comments.length > 0) {
            % if (comment.collapsed) {
                <div a:class="toggle" onclick()=toggle(comment)><a>[+] {{comment.comments.length}} replies collapsed</a></div>
            % } else {
                <div a:class="toggle open" onclick()=toggle(comment)><a>[-]</a></div>
                <c:commentList [comments]=comment.comments />
            % }
      % }
  </li>
  ---`
}

function toggle(comment) {
  comment['collapsed'] = !comment.collapsed;
  refresh();
}