<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="yes"/>

  <!-- Apply styling to the entire document -->
  <xsl:template match="/">
    <html>
      <head>
        <title>Atom Feed</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #ffffff; /* White background */
            color: #333;
          }

          .feed {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background: rgba(255, 255, 255, 0.8); /* Translucent background */
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px); /* Blur effect */
          }

          h1 {
            color: #333;
          }

          a {
            color: #1a0dab;
            text-decoration: none;
          }

          a:hover {
            text-decoration: underline;
          }

          p {
            margin: 0 0 1em;
          }
        </style>
      </head>
      <body>
        <div class="feed">
          <h1><xsl:value-of select="/feed/title"/></h1>
          <xsl:for-each select="/feed/entry">
            <div class="entry">
              <div class="entry-title">
                <a href="{link}">
                  <xsl:value-of select="title"/>
                </a>
              </div>
              <div class="entry-summary">
                <xsl:value-of select="summary"/>
              </div>
              <div class="entry-content">
                <xsl:value-of select="content"/>
              </div>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
