﻿using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Optimajet.DWKit.StarterApplication.Data;
using Optimajet.DWKit.StarterApplication.Models;
using SIL.AppBuilder.Portal.Backend.Tests.Acceptance.Support;
using Xunit;

namespace SIL.AppBuilder.Portal.Backend.Tests.Acceptance.APIControllers.Projects
{
    [Collection("WithoutAuthCollection")]
    public class GetProjectsTest : BaseTest<NoAuthStartup>
    {
        public GetProjectsTest(TestFixture<NoAuthStartup> fixture) : base(fixture)
        {
        }

        public User CurrentUser { get; set; }
        public OrganizationMembership CurrentUserMembership { get; set; }
        public OrganizationMembership CurrentUserMembership2 { get; set; }
        public User user1 { get; private set; }
        public User user2 { get; private set; }
        public User user3 { get; private set; }
        public Organization org1 { get; private set; }
        public Organization org2 { get; private set; }
        public Organization org3 { get; private set; }
        public Group group1 { get; set; }
        public Group group2 { get; set; }
        public Group group3 { get; set; }
        public Group group4 { get; set; }
        public GroupMembership groupMembership1 { get; set; }
        public Project project1 { get; set; }
        public Project project2 { get; set; }
        public Project project3 { get; set; }
        public Project project4 { get; set; }
        public Reviewer reviewer1 { get; set; }
        public Reviewer reviewer2 { get; set; }
        public Reviewer reviewer3 { get; set; }

        private void BuildTestData()
        {
            CurrentUser = NeedsCurrentUser();
            org1 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg1",
                WebsiteUrl = "https://testorg1.org",
                BuildEngineUrl = "https://buildengine.testorg1",
                BuildEngineApiAccessToken = "replace",
                OwnerId = CurrentUser.Id

            });
            org2 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg2",
                WebsiteUrl = "https://testorg2.org",
                BuildEngineUrl = "https://buildengine.testorg2",
                BuildEngineApiAccessToken = "replace",
                OwnerId = CurrentUser.Id

            });
            org3 = AddEntity<AppDbContext, Organization>(new Organization
            {
                Name = "TestOrg3",
                WebsiteUrl = "https://testorg3.org",
                BuildEngineUrl = "https://buildengine.testorg3",
                BuildEngineApiAccessToken = "replace",
                OwnerId = CurrentUser.Id

            });
            CurrentUserMembership = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = CurrentUser.Id,
                OrganizationId = org1.Id
            });
            CurrentUserMembership2 = AddEntity<AppDbContext, OrganizationMembership>(new OrganizationMembership
            {
                UserId = CurrentUser.Id,
                OrganizationId = org2.Id
            });
            group1 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup1",
                Abbreviation = "TG1",
                OwnerId = org1.Id
            });
            group2 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup2",
                Abbreviation = "TG2",
                OwnerId = org1.Id
            });
            group3 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup3",
                Abbreviation = "TG3",
                OwnerId = org2.Id
            });
            group4 = AddEntity<AppDbContext, Group>(new Group
            {
                Name = "TestGroup4",
                Abbreviation = "TG4",
                OwnerId = org3.Id
            });
            groupMembership1 = AddEntity<AppDbContext, GroupMembership>(new GroupMembership
            {
                UserId = CurrentUser.Id,
                GroupId = group1.Id
            });
            project1 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project1",
                Type = "scriptureappbuilder",
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group1.Id,
                OrganizationId = org1.Id,
                Language = "eng-US",
                Private = false
            });
            project2 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project2",
                Type = "scriptureappbuilder",
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group1.Id,
                OrganizationId = org1.Id,
                Language = "eng-US",
                Private = false
            });
            project3 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project3",
                Type = "scriptureappbuilder",
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group3.Id,
                OrganizationId = org2.Id,
                Language = "eng-US",
                Private = false
            });
            project4 = AddEntity<AppDbContext, Project>(new Project
            {
                Name = "Test Project4",
                Type = "scriptureappbuilder",
                Description = "Test Description",
                OwnerId = CurrentUser.Id,
                GroupId = group4.Id,
                OrganizationId = org3.Id,
                Language = "eng-US",
                Private = false
            });
            reviewer1 = AddEntity<AppDbContext, Reviewer>(new Reviewer
            {
                Name = "David Moore",
                Email = "david_moore1@sil.org",
                ProjectId = project1.Id
            });
            reviewer2 = AddEntity<AppDbContext, Reviewer>(new Reviewer
            {
                Name = "Chris Hubbard",
                Email = "chris_hubbard@sil.org",
                ProjectId = project1.Id
            });
            reviewer3 = AddEntity<AppDbContext, Reviewer>(new Reviewer
            {
                Name = "David Moore",
                Email = "david_moore1@sil.org",
                ProjectId = project2.Id
            });

        }
        [Fact]
        public async Task Get_Projects_For_An_OrganizationHeader()
        {
            BuildTestData();

            var url = "/api/projects";
            var response = await Get(url, org1.Id.ToString());

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            Assert.Equal(2, projects.Count);

            var ids = projects.Select(p => p.Id);

            Assert.Contains(project1.Id, ids);
            Assert.Contains(project2.Id, ids);
            Assert.DoesNotContain(project3.Id, ids);
            Assert.DoesNotContain(project4.Id, ids);
        }
        [Fact]
        async Task Get_With_No_Organization()
        {
            BuildTestData();
            var url = "/api/projects";
            var response = await Get(url); // Empty string for org header

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            Assert.Equal(3, projects.Count);

            var ids = projects.Select(p => p.Id);

            Assert.Contains(project1.Id, ids);
            Assert.Contains(project2.Id, ids);
            Assert.Contains(project3.Id, ids);
            Assert.DoesNotContain(project4.Id, ids);

        }
        [Fact]
        async Task Get_With_Invalid_Organization()
        {
            BuildTestData();
            var url = "/api/projects";
            var response = await Get(url, org3.Id.ToString());

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            Assert.Empty(projects);
        }
        [Fact]
        public async Task GetProjects_IncludeReviewers()
        {
            BuildTestData();
 
            var response = await Get("/api/projects?include=reviewers");
            var responseString = response.Content.ToString();

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var projects = await DeserializeList<Project>(response);

            Assert.Equal(3, projects.Count);
            var reviewerIds = projects.FirstOrDefault().Reviewers.Select(r => r.Id);
            Assert.Contains(reviewer1.Id, reviewerIds);
            Assert.Contains(reviewer2.Id, reviewerIds);
            Assert.DoesNotContain(reviewer3.Id, reviewerIds);
        }


    }
}