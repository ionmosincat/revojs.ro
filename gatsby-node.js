const _ = require(`lodash`);
const path = require(`path`);
const slug = require(`slug`);
const slash = require(`slash`);

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  return graphql(
    `
      {
        allSpeakersJson(limit: 1000) {
          edges {
            node {
              id
              image
              talkId
            }
          }
        }
        allTalksJson(limit: 1000) {
          edges {
            node {
              id
            }
          }
        }
        allMarkdownRemark(
          sort: { order: DESC, fields: [frontmatter___date] }
          limit: 1000
        ) {
          edges {
            node {
              frontmatter {
                path
              }
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors;
    }

    // Create image post pages.
    const speakerTemplate = path.resolve(`src/templates/speakerDetails.jsx`);
    // We want to create a detailed page for each
    // Instagram post. Since the scrapped Instagram data
    // already includes an ID field, we just use that for
    // each page's path.
    _.each(result.data.allSpeakersJson.edges, edge => {
      // Gatsby uses Redux to manage its internal state.
      // Plugins and sites can use functions like "createPage"
      // to interact with Gatsby.
      createPage({
        // Each page is required to have a `path` as well
        // as a template component. The `context` is
        // optional but is often necessary so the template
        // can query data specific to each page.
        path: `/speakers/${slug(edge.node.id.toLowerCase())}/`,
        component: slash(speakerTemplate),
        context: {
          id: edge.node.id,
          image: edge.node.image,
          talkId: edge.node.talkId
        }
      });
    });

    const talkTemplate = path.resolve(`src/templates/talkDetails.jsx`);
    _.each(result.data.allTalksJson.edges, edge => {
      createPage({
        path: `/talk/${slug(edge.node.id.toLowerCase())}/`,
        component: slash(talkTemplate),
        context: {
          id: edge.node.id,
          image: edge.node.image
        }
      });
    });

    const blogPostTemplate = path.resolve(`src/templates/blogPost.jsx`);

    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
      createPage({
        path: node.frontmatter.path,
        component: blogPostTemplate,
        context: {
          url: node.frontmatter.path
        } // additional data can be passed via context
      });
    });
  });
};
