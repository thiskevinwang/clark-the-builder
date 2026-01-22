# Create PlanetScale Database Tool

This tool creates a new PostgreSQL database on PlanetScale.

## Usage

Use this tool when the user needs to:

- Create a new database for their application
- Provision a PlanetScale PostgreSQL database
- Set up database infrastructure for a project

## Parameters

- `name` (required): The name for the database. Should be lowercase, alphanumeric, and may include hyphens.
- `organization` (required): The PlanetScale organization name where the database will be created.
- `region` (optional): The region where the database will be deployed. Defaults to the organization's default region.
- `clusterSize` (required): The cluster size SKU (e.g., 'PS_5').
- `replicas` (optional): Number of replicas. 0 for non-HA, 2+ for HA. Defaults to 0.

## Notes

- The database is created as a PostgreSQL database by default.
- Database creation may take a few moments to complete.
- Returns the database ID and connection details on success.
