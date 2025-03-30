const nano = require("nano")

// Connect to CouchDB
const couchdb = nano(process.env.COUCHDB_URL || "http://admin:password@localhost:5984")

// Create screenshots database if it doesn't exist
async function setupDatabase() {
  try {
    // Check if the database exists
    const dbList = await couchdb.db.list()

    if (!dbList.includes("screenshots")) {
      // Create the database
      await couchdb.db.create("screenshots")
      console.log("CouchDB screenshots database created")
    }

    console.log("CouchDB connection successful")
  } catch (error) {
    console.error("CouchDB setup error:", error)
  }
}

setupDatabase()

// Get the screenshots database
const screenshots = couchdb.use("screenshots")

module.exports = { couchdb, screenshots }

