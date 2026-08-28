/* admin_help.js — Amayaa Admin Help System
   Auto-injects an ⓘ button into every admin topbar.
   Slide-in right panel with 7 collapsible sections per page.
   Loaded automatically via sidebar.js — no per-page changes needed.
*/
(function(){
'use strict';

// ── Page detection ────────────────────────────────────────────────────────────
function detectPage(){
  var p = window.location.pathname.split('/').pop().replace('.html','');
  var map = {
    'amayaa_dashboard':       'dashboard',
    'amayaa_products':        'products',
    'amayaa_product_edit':    'product_edit',
    'amayaa_categories':      'categories',
    'amayaa_banners':         'banners',
    'amayaa_blog':            'blog',
    'amayaa_settings':        'settings',
    'amayaa_typography':      'typography',
    'amayaa_faq':             'faq',
    'amayaa_policies':        'policies',
    'amayaa_content_library': 'content_library',
    'amayaa_bulk_upload':     'bulk_upload',
    'amayaa_audit':           'audit_trail',
    'amayaa_about':           'about'
  };
  return map[p] || null;
}

// ── Help content database ─────────────────────────────────────────────────────
var HELP = {

  dashboard: {
    title: 'Dashboard',
    overview: 'Central command page for Amayaa admin. Shows at-a-glance product stats, recent audit entries, quick-access cards to all sections, and a link to the live website. Read-only — no data is written here.',
    functions: [
      'Live product stats: total, active, sold out, hidden, drafts',
      'Recent audit trail entries (last 10 actions)',
      'Quick-access cards to each admin section',
      'Visitor count pulled from GoatCounter via settings.json',
      'Direct link to live public website'
    ],
    fields: [
      {n:'Total Products',    d:'All non-deleted, non-draft products.'},
      {n:'Active',            d:'Products currently visible on the public sarees page.'},
      {n:'Sold Out / Hidden', d:'Products not visible but retained in system.'},
      {n:'Drafts',            d:'Products saved but never published. Excluded from totals.'},
      {n:'Audit Entries',     d:'Last 10 admin actions from audit_trail.json.'}
    ],
    howto: [
      {t:'Check how many products are live',      s:['Open Dashboard — "Active" stat shows count.']},
      {t:'Navigate to a section quickly',         s:['Click any card in the quick-links grid.']},
      {t:'See recent admin activity',             s:['Scroll to Audit Trail section, or open Audit Trail page for full history.']}
    ],
    rules: [
      'Dashboard stats read directly from products_index.json — no cache layer.',
      'Deleted and Draft products are excluded from the Total count.',
      'Audit Trail section only appears if the feature is enabled in Settings → Site Controls.'
    ],
    impacts: [
      {a:'Any action on Dashboard', i:'None — read-only page.', r:'N/A'}
    ],
    troubleshooting: [
      {p:'Stats show 0 products',   f:'Check that data/products_index.json is accessible. Verify GitHub token is set in Settings.'},
      {p:'Audit trail section empty', f:'Enable Audit Trail in Settings → Site Controls. Perform any save action to generate the first entry.'}
    ]
  },

  products: {
    title: 'Product Manager',
    overview: 'Full product list with filtering, status management, soft/hard delete, duplication, and quick-view drawer. All changes write to data/products_index.json via GitHub API. One save runs at a time — rapid clicks are safely blocked.',
    functions: [
      'Filter by status: All · Active · Sold Out · Hidden · Drafts · 🗑 Deleted',
      'Real-time search by name, SKU, or type',
      'Toggle Active ↔ Sold Out (with concurrency guard)',
      'Soft delete → Move to Trash (recoverable)',
      'Hard delete → Permanently remove product and its JSON file',
      'Restore soft-deleted products (returns as "hidden")',
      'Duplicate product → opens pre-filled Add Duplicate Product page',
      'Click any row → quick-view drawer',
      'Edit button → full product edit page',
      'Export full list to Excel'
    ],
    fields: [
      {n:'Filter chips',         d:'All / Active / Sold Out / Hidden / Drafts / 🗑 Deleted — click to switch view.'},
      {n:'Search box',           d:'Filters by product name, SKU, or type in real time.'},
      {n:'🔴 Mark Sold',         d:'Sets status to sold_out. Blocked if a save is in progress.'},
      {n:'🟢 Mark Active',       d:'Sets status to active.'},
      {n:'⧉ Dup',               d:'Opens Add Duplicate Product page pre-filled from this product.'},
      {n:'✏ Edit',              d:'Opens full product edit page.'},
      {n:'🗑 Trash',             d:'Modal: Move to Trash (soft) or Permanently Delete (hard).'},
      {n:'↩ Restore',            d:'Visible on deleted products only — restores to "hidden".'}
    ],
    howto: [
      {t:'Mark a product sold out',    s:['Click "🔴 Mark Sold" on the row.', 'Wait for save — do not click again while saving.']},
      {t:'Soft delete a product',      s:['Click 🗑 icon.', 'Select "Move to Trash".', 'Product moves to Deleted filter, hidden from public site.']},
      {t:'Permanently delete',         s:['Click 🗑 icon.', 'Select "Permanently Delete" and confirm.', 'Product JSON deleted — cannot be undone.']},
      {t:'Restore a deleted product',  s:['Click "🗑 Deleted" chip.', 'Find product.', 'Click "↩ Restore" — status becomes hidden.', 'Open Edit to review and publish.']},
      {t:'Duplicate a product',        s:['Click "⧉ Dup" on any non-deleted row.', 'Add Duplicate page opens pre-filled.', 'Upload fresh images, adjust, then publish.']}
    ],
    rules: [
      'Only one GitHub save runs at a time. Rapid status toggles are blocked while saving.',
      'Deleted + Draft products excluded from Total stat. Their counts appear on their filter chips.',
      'Restored products come back as "hidden" — admin must set Active manually.',
      'Hard delete removes the product JSON file AND index entry. Images in ImageKit are NOT deleted.',
      'Duplicate generates a new unique SKU but copies all other fields except images. Starts as Draft.'
    ],
    impacts: [
      {a:'Mark Sold / Active',    i:'Updates status in products_index.json.',               r:'Yes — toggle again.'},
      {a:'Soft Delete',           i:'Sets status=deleted. Hidden from public site.',         r:'Yes — Restore.'},
      {a:'Permanently Delete',    i:'Removes from index + deletes products/[id].json.',      r:'No.'},
      {a:'Restore',               i:'Sets status=hidden in products_index.json.',            r:'Yes — delete again.'},
      {a:'Duplicate',             i:'New draft product created. Not public until published.',r:'Yes — delete the duplicate.'}
    ],
    troubleshooting: [
      {p:'Mark Sold does nothing',          f:'A save is in progress. Wait 2–3 seconds and retry.'},
      {p:'Product list is empty',           f:'Check GitHub token in Settings. Confirm data/products_index.json exists in repo.'},
      {p:'Deleted chip shows nothing',      f:'No products soft-deleted yet. Use 🗑 → Move to Trash to soft-delete one.'},
      {p:'Thumbnails not showing',          f:'Check image path in products_index starts with "images/" (lowercase). File must exist in repo.'}
    ]
  },

  product_edit: {
    title: 'Product Edit / Add',
    overview: 'Full product creation and editing. Handles all fields, 4-slot image upload with crop, content library linking, SKU generation, and direct GitHub API save. Also used as "Add Duplicate Product" when opened via the Dup button.',
    functions: [
      'Create new product or edit existing',
      'Auto-generate SKU from type category + sequence number',
      'Upload up to 4 product images with crop/resize (Cropper.js)',
      'Link a Content Bundle or individual content IDs from Content Library',
      'Auto-fill Region/Origin when a Weave/Region type is selected',
      'Set price, offer price, status, and badges (New, Featured)',
      'Save to GitHub API — creates/updates product JSON and index entry',
      'Cancel with unsaved-changes navigation guard',
      'Duplicate mode: pre-fills from source, images cleared, status forced to Draft'
    ],
    fields: [
      {n:'SKU',               d:'Auto-generated: AMY-[TYPE]-[SEQ]. Do not edit unless correcting.'},
      {n:'Product Name',      d:'Display name on public site, search, and admin.'},
      {n:'Type (Weave/Region)',d:'Drives filter chips on sarees page. Selecting auto-fills Region/Origin.'},
      {n:'Region/Origin',     d:'Auto-filled from categories.json when Type is selected. Can be overridden.'},
      {n:'Fabric',            d:'Fabric composition — shown on product drawer.'},
      {n:'Colour',            d:'Primary colour tag for search and filter.'},
      {n:'Price',             d:'MRP shown on product card.'},
      {n:'Offer Price',       d:'Discounted price — only shown when Offer toggle is ON.'},
      {n:'Offer toggle',      d:'Enables offer price display on public site.'},
      {n:'Status',            d:'draft / active / hidden / sold_out. Only "active" appears on public site.'},
      {n:'New / Featured',    d:'Checkbox badges shown as chips on product cards.'},
      {n:'Content Bundle',    d:'Links a preset (weave story + care + description) from Content Library.'},
      {n:'Image Slots 1–4',   d:'Slot 1 = main thumbnail. Slots 2–4 = gallery. Click slot to upload and crop.'}
    ],
    howto: [
      {t:'Add a new product',       s:['Product Manager → "+ Add Product".', 'Fill name, type, fabric, colour, price.', 'Upload at least Slot 1 image.', 'Select Content Bundle or fill individual IDs.', 'Set status to "active" to publish.', 'Click Save.']},
      {t:'Edit an existing product', s:['Product Manager → Edit on row.', 'Modify fields.', 'Click Save — live after GitHub Pages deploy (~2 min).']},
      {t:'Upload and crop an image', s:['Click an image slot.', 'Choose file from disk.', 'Crop modal opens — adjust framing.', 'Click "Save Crop" — image resizes and uploads to ImageKit.']},
      {t:'Set a product on offer',   s:['Toggle "On Offer" switch ON.', 'Enter Offer Price.', 'Save.']},
      {t:'Duplicate a product',      s:['Product Manager → "⧉ Dup" on row.', 'Page opens pre-filled (images cleared).', 'Upload fresh photos, adjust fields.', 'Set status Active when ready to publish.']}
    ],
    rules: [
      'Slot 1 image is the thumbnail shown in Product Manager and search results — always fill it.',
      'Region/Origin auto-fill comes from categories.json. Edit categories to change available options.',
      'Offer Price only appears on public site when Offer toggle is ON.',
      'Status "draft" — product is saved but never shown on public site.',
      'Duplicate mode always starts as Draft and must be manually published.',
      'ImageKit private key (amayaa_ik_private_key in localStorage) required for image uploads.',
      'GitHub token (amayaa_gh_token in localStorage) required for Save to work.'
    ],
    impacts: [
      {a:'Save new product',       i:'Creates data/products/[id].json + adds to products_index.json.',           r:'Yes — delete from Product Manager.'},
      {a:'Save edited product',    i:'Overwrites products/[id].json + updates index. No version history.',        r:'Yes — edit again (no undo).'},
      {a:'Set status to active',   i:'Product visible on public site after GitHub Pages deploy.',                  r:'Yes — set back to hidden/draft.'},
      {a:'Upload image',           i:'Stored on ImageKit CDN. Path saved in product JSON.',                       r:'Must delete from ImageKit manually.'}
    ],
    troubleshooting: [
      {p:'Save button does nothing',          f:'GitHub token not set or expired. Go to Settings → Token Setup.'},
      {p:'Image upload fails',               f:'Check amayaa_ik_private_key in localStorage. Check browser console for error.'},
      {p:'Region/Origin not auto-filling',    f:'Confirm categories.json has Origin values saved. Hard-refresh edit page (Cmd+Shift+R).'},
      {p:'SKU not generating',               f:'Select a Type first — SKU prefix is derived from the type/category.'}
    ]
  },

  categories: {
    title: 'Categories Manager',
    overview: 'Manages product taxonomy: Fabric types, Weave/Region types (each with an Origin value), and Occasion tags. Changes cascade to filter chips on the public sarees page and to the Type dropdown on Product Edit.',
    functions: [
      'Add / edit / delete Fabric types',
      'Add / edit / delete Weave/Region types with Origin auto-fill values',
      'Add / edit / delete Occasion tags',
      'Save to data/categories.json via GitHub API',
      'localStorage cache (amayaa_cats_v1) ensures instant load on next open'
    ],
    fields: [
      {n:'Fabric Type',        d:'E.g. "Pure Silk". Appears as a filter chip on the sarees page.'},
      {n:'Weave/Region Name',  d:'E.g. "Banarasi". Appears in Type dropdown on product edit and as a filter chip.'},
      {n:'Origin',             d:'Auto-fill value for Region/Origin on product edit when this Weave is selected. E.g. "Varanasi, Uttar Pradesh".'},
      {n:'Occasion',           d:'E.g. "Wedding". Used for occasion filter chips on sarees page.'}
    ],
    howto: [
      {t:'Add a weave type with origin', s:['Click "+ Add Weave/Region".', 'Enter Name (e.g. Banarasi) and Origin (e.g. Varanasi, UP).', 'Click Save.', 'Hard-refresh Product Edit to see new option.']},
      {t:'Add a fabric type',            s:['Click "+ Add Fabric".', 'Enter name.', 'Click Save.']},
      {t:'Delete a category',            s:['Click ✕ next to entry.', 'Click Save.', 'Existing products with that type are NOT updated automatically.']}
    ],
    rules: [
      'Deleting a category does NOT update existing products — they retain the old type string.',
      'Origin field must be filled for auto-fill to work on Product Edit. If blank, no auto-fill.',
      'Public sarees page filter updates only after GitHub Pages deploy (~2 min).',
      'localStorage cache is written on every successful save, preventing CDN stale-read issues.',
      'If a deleted category type still exists on products, those products appear with an unmatched filter chip.'
    ],
    impacts: [
      {a:'Add category',      i:'New filter chip on sarees page; new option in Product Edit dropdown.', r:'Yes — delete it.'},
      {a:'Delete category',   i:'Filter chip disappears. Existing products unaffected.',                r:'Re-add manually.'},
      {a:'Edit Origin value', i:'Future auto-fills on Product Edit use new value. Saved products unchanged.', r:'Yes — edit again.'}
    ],
    troubleshooting: [
      {p:'New category not appearing after save',        f:'Wait for GitHub Pages deploy. Hard-refresh admin page (Cmd+Shift+R) to clear localStorage.'},
      {p:'Save fails',                                   f:'Check GitHub token in Settings. Check browser console.'},
      {p:'Origin not auto-filling on product edit',      f:'Ensure Origin field is filled in Categories for that Weave/Region. Hard-refresh Product Edit.'}
    ]
  },

  banners: {
    title: 'Banner Manager',
    overview: 'Controls the hero image slideshow on the homepage (index.html). Each banner has an image, headline, subtext, and a CTA button. Changes write to data/banners.json.',
    functions: [
      'Add / edit / delete hero banners',
      'Reorder banners via arrows',
      'Set image URL, headline, subtext, CTA label and link',
      'Toggle banner active/inactive without deleting',
      'Save to data/banners.json via GitHub API'
    ],
    fields: [
      {n:'Image URL',    d:'Path to banner image. Use images/banners/ folder or ImageKit URL.'},
      {n:'Headline',     d:'Large hero text — typically 3–5 words.'},
      {n:'Subtext',      d:'Supporting line below headline.'},
      {n:'CTA Label',    d:'Button text (e.g. "Explore Collection").'},
      {n:'CTA Link',     d:'URL the button navigates to (e.g. amayaa_sarees.html).'},
      {n:'Active toggle',d:'OFF = banner hidden from slideshow but not deleted.'}
    ],
    howto: [
      {t:'Add a hero banner',         s:['Click "+ Add Banner".', 'Enter image URL, headline, subtext, CTA.', 'Click Save.', 'Live after GitHub Pages deploy.']},
      {t:'Reorder banners',           s:['Use up/down arrows to reorder.', 'Click Save.']},
      {t:'Temporarily hide a banner', s:['Toggle Active switch OFF.', 'Click Save.', 'Banner hidden without deletion.']}
    ],
    rules: [
      'Banner images must be in the repo (images/banners/) or on ImageKit CDN — local file paths won\'t work on live site.',
      'GitHub Pages is case-sensitive — use lowercase paths (images/banners/, not Images/Banners/).',
      'Recommended image ratio: 16:9 or 3:1 landscape. Tall images are cropped by CSS.'
    ],
    impacts: [
      {a:'Add / edit banner', i:'Homepage slideshow updates after GitHub Pages deploy.', r:'Yes — edit or delete.'},
      {a:'Delete banner',     i:'Removed from banners.json permanently.',                r:'No — must re-add.'},
      {a:'Reorder',           i:'Slideshow display order changes.',                      r:'Yes — reorder again.'}
    ],
    troubleshooting: [
      {p:'Banner image missing on live site', f:'Check path is lowercase and file is committed to repo. ImageKit URLs are immediate.'},
      {p:'CTA button broken link',            f:'Verify CTA Link is a valid relative or absolute URL.'}
    ]
  },

  blog: {
    title: 'Blog Manager',
    overview: 'Manages all blog posts. Each post has metadata (title, author, date, tags, cover) and a full Markdown body. Posts render on amayaa_blog.html (card list) and amayaa_blog_post.html (reader). Changes write to data/blog.json.',
    functions: [
      'Create / edit / delete blog posts',
      'Rich Markdown editor (EasyMDE) with 5 content templates',
      'Set cover image, author, publish date, tags, category',
      'Save as published or draft',
      'Save to data/blog.json via GitHub API'
    ],
    fields: [
      {n:'Title',       d:'Post headline shown on blog list and reader page.'},
      {n:'ID / Slug',   d:'URL-safe identifier (e.g. BLG-001). Auto-generated. Used in ?id= deep links.'},
      {n:'Author',      d:'Byline displayed on the post.'},
      {n:'Date',        d:'Publication date shown on blog card.'},
      {n:'Cover Image', d:'Image URL for blog card and reader page header.'},
      {n:'Tags',        d:'Comma-separated tags for filtering.'},
      {n:'Status',      d:'"published" shows on public blog. "draft" is hidden.'},
      {n:'Body',        d:'Full post content in Markdown — rendered as HTML on reader page.'}
    ],
    howto: [
      {t:'Write a new post',      s:['Click "+ New Post".', 'Fill title, author, date, tags, cover.', 'Pick a template in the editor.', 'Write content in Markdown.', 'Set status to published.', 'Click Save.']},
      {t:'Edit an existing post', s:['Click Edit on the row.', 'Modify content.', 'Click Save.', 'Live after GitHub Pages deploy.']},
      {t:'Save a draft',          s:['Set Status to "draft".', 'Click Save.', 'Post saved but hidden from public blog.']}
    ],
    rules: [
      'Draft posts are NOT shown on amayaa_blog.html.',
      'Post slugs must be unique and URL-safe — used in ?id= deep link.',
      'Cover images should be in repo (images/blog/) or ImageKit. External URLs may break.'
    ],
    impacts: [
      {a:'Publish post',     i:'Post appears on blog list and reader page.',        r:'Yes — set back to draft.'},
      {a:'Delete post',      i:'Removed from blog.json. Direct links will 404.',     r:'No — must re-add.'},
      {a:'Edit post body',   i:'Reader page content updates after deploy.',          r:'Yes — edit again.'}
    ],
    troubleshooting: [
      {p:'Post not on blog page',       f:'Ensure status is "published". Wait for GitHub Pages deploy.'},
      {p:'Markdown not rendering',      f:'Check for unclosed code blocks or broken markdown syntax.'},
      {p:'Cover image broken',          f:'Verify image path and confirm file exists in repo.'}
    ]
  },

  settings: {
    title: 'Settings Manager',
    overview: 'Site-wide configuration: nav links, footer columns, contact info, social links, GitHub token, Coming Soon gate, and Audit Trail toggle. Saves to data/settings.json via GitHub API. Tokens are stored locally only — never committed to repo.',
    functions: [
      'Edit public site navigation links',
      'Edit footer column content and contact info',
      'Set social media links (Instagram, Facebook, WhatsApp, Pinterest)',
      'Enable / disable Coming Soon password gate',
      'Enable / disable Audit Trail logging',
      'Set and save GitHub Personal Access Token (local only)',
      'Set GoatCounter analytics token (local only)',
      'Save to data/settings.json'
    ],
    fields: [
      {n:'GitHub Token',       d:'PAT with repo scope. Stored in localStorage only — never in git.'},
      {n:'GoatCounter Token',  d:'Analytics API token. Stored in localStorage.'},
      {n:'Coming Soon toggle', d:'ON = public site shows gate.html (password protected).'},
      {n:'Audit Trail toggle', d:'ON = admin actions logged to data/audit_trail.json.'},
      {n:'Nav Links',          d:'Array of {label, url} for the public site nav bar.'},
      {n:'Footer Columns',     d:'Content blocks in the footer of all public pages.'},
      {n:'Contact Info',       d:'Phone, email, address — shown in footer and contact page.'},
      {n:'Social Links',       d:'Platform URLs for social media icons.'}
    ],
    howto: [
      {t:'Set GitHub token',       s:['Settings → Token Setup section.', 'Paste GitHub PAT.', 'Click Save Token.', 'Token saved to localStorage only.']},
      {t:'Enable Coming Soon mode',s:['Toggle "Coming Soon" ON.', 'Click Save.', 'Public site gated after deploy.']},
      {t:'Add a nav link',         s:['Nav Links section → "+ Add Link".', 'Enter label and URL.', 'Click Save Settings.', 'Live after GitHub Pages deploy.']}
    ],
    rules: [
      'GitHub token stored ONLY in localStorage — never committed to any file.',
      'Coming Soon gate affects ALL public pages. Disable before full launch.',
      'Audit Trail requires data/audit_trail.json to exist in repo.',
      'Nav and footer changes need GitHub Pages deploy (~2 min) to go live.',
      'localStorage is browser-specific — re-enter token if you switch browsers or clear data.'
    ],
    impacts: [
      {a:'Save Settings',          i:'Writes data/settings.json. Nav/footer update after deploy.',     r:'Yes — edit again.'},
      {a:'Enable Coming Soon',     i:'Public site becomes password-gated after deploy.',                r:'Yes — toggle OFF.'},
      {a:'Update GitHub token',    i:'All subsequent API saves use new token.',                         r:'Yes — update again.'}
    ],
    troubleshooting: [
      {p:'Save fails with 401',          f:'GitHub token expired or invalid. Generate a new PAT with "repo" scope.'},
      {p:'Nav changes not on live site', f:'Wait for GitHub Pages deploy (2–5 min). Hard-refresh (Cmd+Shift+R).'},
      {p:'Token gets cleared',           f:'localStorage is browser-specific. Re-enter token after clearing browser data.'}
    ]
  },

  typography: {
    title: 'Typography Manager',
    overview: 'Controls fonts, colours, and sizing for both the Admin Panel and Public Website. Changes write to data/typography.json and are applied to the live site via public.css / nav.js.',
    functions: [
      'Set heading and body fonts for Admin Panel and Public Website (separate tabs)',
      'Configure colour palette orbs per product type',
      'Set font sizes for headings, subtext, body, small text',
      'Preview changes before saving',
      'Save to data/typography.json via GitHub API'
    ],
    fields: [
      {n:'Admin tab',          d:'Font/colour settings applied to admin panel pages only.'},
      {n:'Public Website tab', d:'Settings applied to all public pages via nav.js injection.'},
      {n:'Colour Palette Orbs',d:'Colour chips for each product type — shown on product cards and drawer.'},
      {n:'Heading Font',       d:'Google Fonts family name for headings (e.g. Cormorant Garamond).'},
      {n:'Body Font',          d:'Google Fonts family for body text (e.g. Lato).'},
      {n:'Font Sizes',         d:'px or rem values for H1, H2, H3, body, small text.'}
    ],
    howto: [
      {t:'Change public heading font', s:['Click Public Website tab.', 'Enter heading font name (exact Google Fonts name).', 'Click Save.', 'Live after GitHub Pages deploy.']},
      {t:'Add a colour orb',           s:['Scroll to Colour Palette section.', 'Click "+ Add Colour".', 'Enter label (must match product type exactly) and pick colour.', 'Click Save.']}
    ],
    rules: [
      'Public typography changes require GitHub Pages deploy (~2 min) to appear on live site.',
      'Font names must be exact Google Fonts names — typos fall back to system fonts.',
      'Colour orb labels are case-sensitive and must exactly match the product type string.',
      'Admin font changes apply immediately after page reload (CSS variables injected locally).'
    ],
    impacts: [
      {a:'Save typography', i:'Writes data/typography.json. Public pages update after deploy.', r:'Yes — edit and save again.'}
    ],
    troubleshooting: [
      {p:'Font not changing on live site', f:'Confirm exact Google Fonts name. Check typography.json saved. Wait for deploy.'},
      {p:'Colour orbs missing on product cards', f:'Orb label must match product type string exactly (case-sensitive).'}
    ]
  },

  faq: {
    title: 'FAQ Manager',
    overview: 'Manages the public FAQ page content. Questions are grouped by category and stored in data/faq.json. Rendered on the public amayaa_faq.html page.',
    functions: [
      'Add / edit / delete FAQ questions',
      'Organise questions by category',
      'Reorder questions within a category',
      'Save to data/faq.json via GitHub API'
    ],
    fields: [
      {n:'Category', d:'Group heading (e.g. Shipping, Returns, Care Instructions).'},
      {n:'Question',  d:'The FAQ question as displayed to customers.'},
      {n:'Answer',    d:'The answer text — basic HTML supported for links and emphasis.'}
    ],
    howto: [
      {t:'Add a new FAQ', s:['Click "+ Add Question".', 'Select or create a category.', 'Enter question and answer.', 'Click Save.']},
      {t:'Edit a FAQ',    s:['Click Edit on the question row.', 'Modify text.', 'Click Save.']}
    ],
    rules: [
      'FAQ changes require GitHub Pages deploy to appear on public page.',
      'Answer field supports basic HTML — use carefully to avoid layout issues.',
      'Deleting a category removes all questions in it.'
    ],
    impacts: [
      {a:'Add / edit FAQ', i:'Public FAQ page updates after deploy.',     r:'Yes.'},
      {a:'Delete FAQ',     i:'Removed permanently from page.',             r:'No — must re-add.'},
      {a:'Delete category',i:'All questions in that category also removed.', r:'No.'}
    ],
    troubleshooting: [
      {p:'FAQ not on public page', f:'Confirm data/faq.json saved. Wait for GitHub Pages deploy.'},
      {p:'HTML in answer not rendering', f:'Check for unclosed HTML tags.'}
    ]
  },

  policies: {
    title: 'Policies Manager',
    overview: 'Manages content for Shipping, Returns, Privacy, and Terms policy pages. Each policy has multiple sections with a title and body. Saved to data/policies.json.',
    functions: [
      'View and edit policy sections inline per policy type',
      'Add / remove sections per policy',
      'Toggle view / edit mode per section',
      'Save to data/policies.json via GitHub API'
    ],
    fields: [
      {n:'Policy type',    d:'Shipping / Returns / Privacy / Terms — tab to switch.'},
      {n:'Section title',  d:'Heading for this policy block.'},
      {n:'Section body',   d:'Policy text — basic HTML supported.'}
    ],
    howto: [
      {t:'Edit a policy section', s:['Select policy tab.', 'Click Edit on section.', 'Modify text.', 'Click Save Section.', 'Click Save All to commit to GitHub.']},
      {t:'Add a new section',     s:['Click "+ Add Section" at bottom.', 'Enter title and body.', 'Click Save All.']}
    ],
    rules: [
      'Policy changes require GitHub Pages deploy.',
      'Section deletions are permanent once saved — no undo from admin.'
    ],
    impacts: [
      {a:'Edit policy',    i:'Public policy page updates after deploy.', r:'Yes — edit again.'},
      {a:'Delete section', i:'Section removed from public page.',         r:'Must re-add manually.'}
    ],
    troubleshooting: [
      {p:'Policy not updating on public site', f:'Confirm data/policies.json saved. Wait for deploy.'}
    ]
  },

  content_library: {
    title: 'Content Library',
    overview: 'Central repository of reusable text: weave stories, care instructions, and product descriptions. Products link to entries via IDs — edit once, update everywhere. Content Bundles group all three into a single preset.',
    functions: [
      'Add / edit / delete weave stories, care instructions, product descriptions',
      'Create and manage Content Bundles (story + care + description presets)',
      'See which products reference each entry before deleting',
      'Link entries to products from the Product Edit page',
      'Save to data/content_library.json via GitHub API'
    ],
    fields: [
      {n:'Entry ID',        d:'Unique ID (e.g. WS-001, CI-002). Referenced in product JSON as weaveStoryId / careInstructionId / descriptionId.'},
      {n:'Title',           d:'Admin label for this entry.'},
      {n:'Body',            d:'Content text shown on product drawer on public site.'},
      {n:'Content Bundle',  d:'Named preset combining one of each entry type.'},
      {n:'Used by',         d:'Lists which products reference this entry — check before deleting.'}
    ],
    howto: [
      {t:'Add a weave story',     s:['Click "+ Add" in Weave Stories section.', 'Enter ID, title, body.', 'Click Save.']},
      {t:'Create a Content Bundle', s:['Scroll to Content Bundles.', 'Click "+ New Bundle".', 'Select one weave story, care instruction, and description.', 'Name it.', 'Click Save.']},
      {t:'Link content to product', s:['Open Product Edit.', 'In Content section, select Bundle or individual IDs.', 'Save product.']}
    ],
    rules: [
      'Deleting an entry referenced by products will cause blank content on those product pages — always check "Used by" first.',
      'Entry IDs must be unique across the full library.',
      'Content Bundles are convenience presets — individual product overrides are still possible.',
      'Editing an entry body immediately affects all products referencing it (after deploy).'
    ],
    impacts: [
      {a:'Edit entry body',  i:'All products using this ID show updated content after deploy.', r:'Yes — edit again.'},
      {a:'Delete entry',     i:'Products referencing this ID show blank content.',              r:'Re-add with same ID.'},
      {a:'Add bundle',       i:'Bundle appears in Product Edit dropdowns.',                     r:'Yes — delete bundle.'}
    ],
    troubleshooting: [
      {p:'Product drawer shows blank weave story', f:'Check product\'s weaveStoryId. Verify that ID exists in content_library.json.'},
      {p:'Bundle not in Product Edit dropdown',    f:'Save bundle first. Hard-refresh Product Edit (Cmd+Shift+R).'}
    ]
  },

  bulk_upload: {
    title: 'Bulk Upload',
    overview: 'Batch product creation via Excel/CSV template. Generates SKUs, creates individual product JSON files, and updates the product index in one operation. Designed for Draft → Review → Publish workflow.',
    functions: [
      'Download pre-filled template CSV/Excel',
      'Upload completed template for batch product creation',
      'Auto-generate unique SKUs per product row',
      'Create data/products/[id].json for each row',
      'Update data/products_index.json with all new entries',
      'Row-by-row success / error reporting',
      'Remove Product tool — clean up products by SKU'
    ],
    fields: [
      {n:'Template columns',   d:'Name, Type, Fabric, Colour, Price, OfferPrice, Status, IsNew, IsFeatured, WeaveStoryId, CareId, DescriptionId, and more.'},
      {n:'Status column',      d:'Recommended: upload as "draft", review, then publish via Product Manager.'},
      {n:'SKU column',         d:'Leave blank to auto-generate, or provide a custom unique SKU.'}
    ],
    howto: [
      {t:'Bulk upload products', s:['Click "Download Template".', 'Fill product data — one row per product.', 'Save as CSV or Excel.', 'Click "Upload File".', 'Review row-by-row results.', 'Products created as drafts.', 'Review and publish via Product Manager.']},
      {t:'Fix a failed row',     s:['Note the error shown for that row.', 'Fix data in your spreadsheet.', 'Re-upload — rows with existing SKUs are skipped.']}
    ],
    rules: [
      'Always upload as draft first — review before publishing.',
      'SKUs must be unique. Duplicate SKUs will fail.',
      'Content library IDs (WeaveStoryId, CareId etc.) must exist in content_library.json before referencing.',
      'Image fields expect ImageKit URLs or repo paths — images must already be uploaded.',
      'GitHub token must be set in Settings for all write operations.'
    ],
    impacts: [
      {a:'Bulk upload', i:'Creates product JSONs + updates products_index.json. Visible in Product Manager immediately.', r:'Must delete products individually from Product Manager.'}
    ],
    troubleshooting: [
      {p:'Row fails with "SKU exists"',  f:'Remove duplicate SKU from spreadsheet or leave blank for auto-generation.'},
      {p:'Upload stalls mid-way',        f:'GitHub API rate limit. Wait 60 seconds and retry remaining rows.'},
      {p:'"Remove Product" not working', f:'Enter exact SKU. GitHub token must be set.'}
    ]
  },

  audit_trail: {
    title: 'Audit Trail',
    overview: 'Read-only log of all admin actions: product saves, status changes, deletes, banner updates, settings changes, and more. Written by audit.js on each admin page to data/audit_trail.json.',
    functions: [
      'View chronological log of all admin actions',
      'Filter by page or action type',
      'See timestamp, action, affected entity, and admin user',
      'Audit logging can be enabled/disabled in Settings → Site Controls'
    ],
    fields: [
      {n:'Timestamp', d:'Date and time the action occurred.'},
      {n:'Action',    d:'What was done (e.g. "Product Saved", "Status Changed", "Banner Deleted").'},
      {n:'Entity',    d:'Product SKU, banner ID, or other identifier that was affected.'},
      {n:'User',      d:'Admin email from localStorage at time of action.'},
      {n:'Details',   d:'Additional context (e.g. "active → sold_out").'}
    ],
    howto: [
      {t:'Find when a product was last edited', s:['Open Audit Trail.', 'Search or filter by entity (SKU).', 'Find most recent entry for that SKU.']},
      {t:'Enable audit logging',               s:['Settings → Site Controls → Audit Trail toggle ON.', 'Save settings.', 'All subsequent admin actions are now logged.']}
    ],
    rules: [
      'Audit trail is append-only — entries cannot be edited or deleted from admin.',
      'Audit logging must be enabled in Settings to capture actions.',
      'data/audit_trail.json grows indefinitely — archive old entries periodically if the file becomes large.',
      'GitHub token required for audit logging (writes to repo).'
    ],
    impacts: [
      {a:'No write actions on this page', i:'Audit Trail is read-only.', r:'N/A'}
    ],
    troubleshooting: [
      {p:'Audit trail is empty',         f:'Enable Audit Trail in Settings. Perform any admin save action to generate first entry.'},
      {p:'Actions not being logged',     f:'Check audit.js is loaded on the admin page. Verify GitHub token is set.'},
      {p:'Audit log file is very large', f:'Download data/audit_trail.json, archive old entries, and replace with a trimmed version via GitHub.'}
    ]
  },

  about: {
    title: 'Our Story Manager',
    overview: 'Manages content for the public About / Our Story page. Sections cover brand narrative, mission, weaver spotlight, and team. Saved to data/about.json.',
    functions: [
      'Edit / save each story section inline',
      'Update section images',
      'Add or remove sections',
      'Save to data/about.json via GitHub API'
    ],
    fields: [
      {n:'Section title',  d:'Heading for this story block.'},
      {n:'Section body',   d:'Narrative text — basic HTML supported.'},
      {n:'Image URL',      d:'Section image. Use images/ folder path or ImageKit URL.'},
      {n:'Image alt text', d:'Accessibility description for the image.'}
    ],
    howto: [
      {t:'Edit a story section', s:['Click Edit on the section.', 'Modify title, body, or image URL.', 'Click Save Section.', 'Click Save All to commit to GitHub.']},
      {t:'Add a new section',    s:['Click "+ Add Section".', 'Fill title, body, image URL.', 'Click Save All.']}
    ],
    rules: [
      'Changes require GitHub Pages deploy to appear on live About page.',
      'Image URLs must be repo paths (images/) or ImageKit CDN — external URLs may break.',
      'Deleting a section is permanent once saved.'
    ],
    impacts: [
      {a:'Edit section',   i:'Public About page updates after deploy.', r:'Yes — edit again.'},
      {a:'Delete section', i:'Section permanently removed from page.',   r:'Must re-add manually.'}
    ],
    troubleshooting: [
      {p:'Image not showing on live site', f:'Verify path uses lowercase (images/). Commit image file to repo.'},
      {p:'Changes not live after save',    f:'Wait for GitHub Pages deploy (2–5 min). Hard-refresh (Cmd+Shift+R).'}
    ]
  }

}; // end HELP

// ── CSS ───────────────────────────────────────────────────────────────────────
var CSS = [
  '#amayaa-help-btn{',
    'display:inline-flex;align-items:center;justify-content:center;',
    'width:34px;height:34px;border-radius:50%;',
    'background:rgba(106,57,137,.12);border:1.5px solid rgba(106,57,137,.3);',
    'color:#6A3989;font-size:17px;font-weight:700;cursor:pointer;line-height:1;',
    'transition:background .2s,transform .2s;flex-shrink:0;font-family:serif;',
  '}',
  '#amayaa-help-btn:hover{background:rgba(106,57,137,.22);transform:scale(1.08);}',

  '#amayaa-help-overlay{',
    'position:fixed;inset:0;background:rgba(0,0,0,.32);z-index:9998;',
    'opacity:0;pointer-events:none;transition:opacity .25s;',
  '}',
  '#amayaa-help-overlay.ahopen{opacity:1;pointer-events:all;}',

  '#amayaa-help-panel{',
    'position:fixed;top:0;right:0;bottom:0;width:520px;max-width:96vw;',
    'background:#fff;z-index:9999;box-shadow:-4px 0 32px rgba(0,0,0,.18);',
    'display:flex;flex-direction:column;',
    'transform:translateX(100%);transition:transform .3s cubic-bezier(.4,0,.2,1);',
  '}',
  '#amayaa-help-panel.ahopen{transform:translateX(0);}',

  '#amayaa-help-hdr{',
    'padding:16px 20px;border-bottom:1px solid rgba(0,0,0,.08);flex-shrink:0;',
    'display:flex;align-items:center;justify-content:space-between;',
    'background:linear-gradient(135deg,#3D1A5E,#6A3989);',
  '}',
  '#amayaa-help-hdr h2{color:#fff;font-family:"Cormorant Garamond",serif;font-size:19px;font-weight:700;margin:0;}',
  '#amayaa-help-hdr span{font-size:11px;color:rgba(255,255,255,.65);margin-top:2px;display:block;}',
  '#amayaa-help-close{',
    'background:rgba(255,255,255,.15);border:none;color:#fff;',
    'width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px;',
    'display:flex;align-items:center;justify-content:center;flex-shrink:0;',
  '}',
  '#amayaa-help-close:hover{background:rgba(255,255,255,.28);}',

  '#amayaa-help-body{flex:1;overflow-y:auto;padding:14px 18px;}',

  '.ah-sec{border:1px solid rgba(0,0,0,.09);border-radius:9px;margin-bottom:10px;overflow:hidden;}',
  '.ah-sec-hd{',
    'padding:11px 15px;background:rgba(106,57,137,.05);cursor:pointer;',
    'display:flex;align-items:center;justify-content:space-between;',
    'font-weight:600;font-size:13.5px;color:#3D1A5E;user-select:none;',
  '}',
  '.ah-sec-hd:hover{background:rgba(106,57,137,.09);}',
  '.ah-arrow{transition:transform .2s;font-style:normal;font-size:11px;color:#9A8070;}',
  '.ah-sec-bd{padding:13px 15px;display:none;border-top:1px solid rgba(0,0,0,.07);}',
  '.ah-sec-bd.ahopen{display:block;}',
  '.ah-sec-bd p,.ah-sec-bd li{font-size:13px;color:#3A2A1A;line-height:1.65;margin:3px 0;}',
  '.ah-sec-bd ul{margin:5px 0 5px 15px;padding:0;}',

  '.ah-frow{display:grid;grid-template-columns:130px 1fr;gap:6px;padding:5px 0;border-bottom:1px solid rgba(0,0,0,.05);}',
  '.ah-frow:last-child{border:none;}',
  '.ah-fn{font-size:12.5px;font-weight:600;color:#3D1A5E;}',
  '.ah-fd{font-size:12.5px;color:#5A4A3A;}',

  '.ah-ht{margin-bottom:10px;}',
  '.ah-ht strong{font-size:13px;color:#3D1A5E;display:block;margin-bottom:3px;}',
  '.ah-ht ol{margin:0 0 0 15px;padding:0;}',
  '.ah-ht li{font-size:12.5px;color:#3A2A1A;margin:2px 0;}',

  '.ah-tbl{width:100%;border-collapse:collapse;font-size:12.5px;}',
  '.ah-tbl th{background:rgba(106,57,137,.07);color:#3D1A5E;font-weight:600;padding:6px 9px;text-align:left;border:1px solid rgba(0,0,0,.09);}',
  '.ah-tbl td{padding:6px 9px;border:1px solid rgba(0,0,0,.09);vertical-align:top;color:#3A2A1A;}',
  '.ah-tbl tr:nth-child(even) td{background:rgba(0,0,0,.02);}',
  '.ah-ry{color:#1a7a3a;font-weight:600;}',
  '.ah-rn{color:#c0392b;font-weight:600;}',

  '.ah-ts{margin-bottom:9px;padding:9px 11px;background:rgba(255,246,210,.7);',
    'border-left:3px solid #E8B84B;border-radius:4px;}',
  '.ah-ts strong{font-size:12.5px;color:#5A3A00;display:block;margin-bottom:2px;}',
  '.ah-ts span{font-size:12.5px;color:#3A2A1A;}',

  '.ah-ov{font-size:13px;color:#3A2A1A;line-height:1.7;margin:0;}'
].join('');

// ── Helpers ───────────────────────────────────────────────────────────────────
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function sec(icon, label, bodyHtml){
  var id = 'ahs'+Math.random().toString(36).slice(2,7);
  return '<div class="ah-sec">'+
    '<div class="ah-sec-hd" onclick="(function(h){var b=h.nextElementSibling;b.classList.toggle(\'ahopen\');h.querySelector(\'.ah-arrow\').style.transform=b.classList.contains(\'ahopen\')?\'rotate(90deg)\':\'\';})(this)">'+
    '<span>'+icon+' '+label+'</span><em class="ah-arrow">&#9658;</em></div>'+
    '<div class="ah-sec-bd" id="'+id+'">'+bodyHtml+'</div></div>';
}

function buildPanel(key){
  var d = HELP[key];
  if(!d) return '<p style="padding:20px;color:#aaa;font-size:13px;">No help content for this page yet.</p>';

  var s1 = '<p class="ah-ov">'+esc(d.overview)+'</p>';

  var s2 = '<ul>'+d.functions.map(function(f){return '<li>'+esc(f)+'</li>';}).join('')+'</ul>';

  var s3 = d.fields.map(function(f){
    return '<div class="ah-frow"><div class="ah-fn">'+esc(f.n)+'</div><div class="ah-fd">'+esc(f.d)+'</div></div>';
  }).join('');

  var s4 = d.howto.map(function(h){
    return '<div class="ah-ht"><strong>'+esc(h.t)+'</strong>'+
      '<ol>'+h.s.map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ol></div>';
  }).join('');

  var s5 = '<ul>'+d.rules.map(function(r){return '<li>'+esc(r)+'</li>';}).join('')+'</ul>';

  var s6 = '<table class="ah-tbl"><thead><tr><th>Action</th><th>Impact</th><th>Reversible?</th></tr></thead><tbody>'+
    d.impacts.map(function(i){
      var rv = i.r==='Yes' ? '<span class="ah-ry">✓ Yes</span>'
             : i.r==='No'  ? '<span class="ah-rn">✗ No</span>'
             : esc(i.r);
      return '<tr><td>'+esc(i.a)+'</td><td>'+esc(i.i)+'</td><td>'+rv+'</td></tr>';
    }).join('')+'</tbody></table>';

  var s7 = d.troubleshooting.map(function(t){
    return '<div class="ah-ts"><strong>&#128269; '+esc(t.p)+'</strong><span>'+esc(t.f)+'</span></div>';
  }).join('');

  return sec('📋','Page Overview',s1)+
         sec('⚙️','Key Functionalities',s2)+
         sec('🏷️','Field / Control Reference',s3)+
         sec('📖','Common Tasks / How-To',s4)+
         sec('⚠️','Rules &amp; Dependencies',s5)+
         sec('💥','Impact of Changes',s6)+
         sec('🔧','Troubleshooting',s7);
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function openHelp(){
  document.getElementById('amayaa-help-panel').classList.add('ahopen');
  document.getElementById('amayaa-help-overlay').classList.add('ahopen');
}
function closeHelp(){
  document.getElementById('amayaa-help-panel').classList.remove('ahopen');
  document.getElementById('amayaa-help-overlay').classList.remove('ahopen');
}

// ── Init ──────────────────────────────────────────────────────────────────────
function init(){
  if(document.getElementById('amayaa-help-btn')) return; // already injected

  var pageKey = detectPage();

  // Inject CSS
  var st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  // Overlay (closes panel on click-outside)
  var ov = document.createElement('div');
  ov.id = 'amayaa-help-overlay';
  ov.onclick = closeHelp;
  document.body.appendChild(ov);

  // Panel
  var pn = document.createElement('div');
  pn.id = 'amayaa-help-panel';
  var d = pageKey && HELP[pageKey];
  pn.innerHTML =
    '<div id="amayaa-help-hdr">'+
      '<div><h2>'+(d ? esc(d.title) : 'Admin Help')+'</h2>'+
      '<span>Page guide &amp; quick reference</span></div>'+
      '<button id="amayaa-help-close" onclick="(function(){document.getElementById(\'amayaa-help-panel\').classList.remove(\'ahopen\');document.getElementById(\'amayaa-help-overlay\').classList.remove(\'ahopen\');})()" title="Close">&#x2715;</button>'+
    '</div>'+
    '<div id="amayaa-help-body">'+
      (pageKey ? buildPanel(pageKey) : '<p style="padding:20px;color:#aaa;font-size:13px;">No help content for this page.</p>')+
    '</div>';
  document.body.appendChild(pn);

  // Inject ⓘ button — try .topbar-actions first, fall back to last div in .topbar
  var target = document.querySelector('.topbar-actions');
  if(!target){
    var tb = document.querySelector('.topbar');
    if(tb){
      var divs = tb.querySelectorAll('div');
      target = divs[divs.length-1] || tb;
    }
  }
  if(target){
    var btn = document.createElement('button');
    btn.id = 'amayaa-help-btn';
    btn.title = 'Page Help & Guide';
    btn.innerHTML = 'ⓘ';
    btn.onclick = openHelp;
    target.insertBefore(btn, target.firstChild);
  }
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
