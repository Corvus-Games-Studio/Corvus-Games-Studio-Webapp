source "https://rubygems.org"

# Local-dev Jekyll. GitHub Pages builds the live site server-side using its own
# locked toolchain (see https://pages.github.com/versions/), so we don't need
# the github-pages meta-gem locally. We just need to stick to plugins that
# GitHub Pages allows.
gem "jekyll", "~> 4.3"

group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-seo-tag"
  gem "jekyll-sitemap"
end

# Windows-only timezone data
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end
