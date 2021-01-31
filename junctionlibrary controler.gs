include "junctionlibrary base.gs"
include "browser.gs"



class JunctionInitingObj
{
	public bool is_initing = false;
	public bool in_check = false;

	public int i;
	public int old_i;

	public Junction[] j_list;
	public GSTrackSearch GSTS_Initing;

	public int OldDir;
	public MapObject[] MO_arr;

	public bool[] Obj_direction;
	public int q;
	public int p;
	public int qq;
	public int err_numb;
};



class JunctionLoadingObj
{
	public bool IsIniting1_msg = false;

	public int i;
	public int size11;

	public JuctionWithProperties[] J_elements;
};




class SignalInitingObj
{
	public bool is_initing = false;
	public int stage;
	public Signal[] s_list;

	public int i;
	public int old_i;

	public int p;
	public int q;
	public int Station_id;

	public int svetof_numb;

	public int L;
	
};



class StationPathInitingObj
{
	public bool Path_init = false;

	public int i;
	public int old_i;

	public int N;
	public Soup St_prop;

	public int qq;

	public bool stop;
};


class AllPathInitingObj
{
	public bool is_initing = false;

	public int i;
	public int old_i;

	public int L;
};




class DeleteLongPathObj
{
	public bool DeletingLong = false;


	public Soup sv_sp;
	public int SignalId;
	
	public string curr_dst;

	public bool span_path;
	public zxSignal sign1;

	public int SizeOfPaths;

	public float[] lengthA;
	public int[] Id_A;

	public int lenA_num;

	public int sleep_cnt;

	public int k;
	public int old_k;


	public bool result;
};



class DeletePathSignalObj
{
	public bool is_deleting = false;


	public int sign_id;
	
	public string ST_name;

	public int i;
	public int old_i;

	public int SizeOfPaths;
};




class DeletePathStationObj
{
	public bool is_deleting = false;

	public bool reset;
	public bool stop;


	public string ST_name;
	public int svetof_numb;
	public Soup sv_sp;

	public int j;
	public int old_j;
	public int i;
	public int old_i;

	public int SizeOfPaths;
};



class DeleteLongPathAllObj
{
	public bool is_deleting = false;

	public int i;
	public int old_i;

	public int L;
};





class UniqueNamedObjElem isclass GSObject
{
	public MapObject obj_itself;
	public string JunctionName;
};



class zxMainJunctionController isclass zxMainJunctionControllerBase
{

StringTable ST1;


Soup ToSoupJL();
void FromSoupJL(Soup sp);


string Calculated="";
string Calculated2="";


public Browser mn = null;
void RefreshBrowser();


bool Br_mode = false;
string junct_err_string="";
string junc_error2 = "";




string MakeStationList();




int currentStation=-1;

int currentSignalId=-1;

string part_of_st="";

bool reset_jun=false;


void SortAllStations();
void SortAllSignasAtStation(int Station_id);
void MainShowSignals();



bool Junct_init=false;
bool Sign_init = false;



BinarySortedArrayS unique_objBS;



void ResetJunctions()
	{

	int N=BSJunctionLib.N;
	int i;

	int dir1;
	for(i=0;i<N;i++)
		{
		Junction temp = cast<Junction>(Router.GetGameObject(BSJunctionLib.DBSE[i].a));

		if( temp )
			{
			dir1 =(cast<JuctionWithProperties>(BSJunctionLib.DBSE[i].Object)).OldDirection;
			temp.SetDirection(dir1);	
			}
		}

	}


SignalInitingObj signal_init = new SignalInitingObj();



void ProcessInitSignals()
	{

	switch(signal_init.stage)
		{
		case 0:

			while(signal_init.i<signal_init.s_list.size())
				{
				signal_init.q++;
		
				if(signal_init.q>100)
					{
					Calculated2=ST1.GetString("now = ")+(string)(signal_init.i*100/signal_init.s_list.size())+"%";

					PostMessage(me,"Refresh","now",0.0);
					if(sub_browser and !been_refreshing)
						PropertyBrowserRefresh(sub_browser);
	
					

					signal_init.q=0;


					PostMessage(me, "SelfTimedMessage", "ProcessInitSignals", 0.0);

					return;
					}



				zxSignal Sign = cast<zxSignal>(signal_init.s_list[signal_init.i]);

				if(Sign)
					{
					int sign_type = Sign.Type;
					string station_name = Sign.stationName;
					string signal_name = Sign.privateName;

					if(		 (sign_type&zxSignal.ST_UNTYPED) and 
							!(sign_type&zxSignal.ST_PERMOPENED) and 
							station_name!=""  and 
							(!(sign_type&zxSignal.ST_UNLINKED) or (sign_type&(zxSignal.ST_IN|zxSignal.ST_OUT|zxSignal.ST_ROUTER))  ))
						{
						signal_init.Station_id=StationProperties.GetNamedTagAsInt(station_name,-1);
				
						if(signal_init.Station_id>=0)
							{
							int svetof_numb=StationProperties.GetNamedTagAsInt(station_name+".svetof_number",0);
							StationProperties.SetNamedTag(station_name+".svetof_number",(int)(svetof_numb+1));

							(StationProperties.GetNamedSoup(station_name+".svetof_soup")).SetNamedTag("sv_n^"+svetof_numb,(signal_init.s_list[signal_init.i]).GetName());
							(StationProperties.GetNamedSoup(station_name+".svetof_soup")).SetNamedTag("sv^"+svetof_numb,signal_name);
							(StationProperties.GetNamedSoup(station_name+".svetof_soup")).SetNamedTag("sv_type^"+svetof_numb,sign_type);
							}
						else
							{
					
							int st_num=StationProperties.GetNamedTagAsInt("st_Number",0)+1;
	
							StationProperties.SetNamedTag("st_Number",st_num);

							StationProperties.SetNamedTag(station_name,signal_init.p);
							StationProperties.SetNamedTag("station_name_by_ID"+signal_init.p,station_name);

					
							StationProperties.SetNamedTag(station_name+".svetof_number",1);

	
							Soup NewSoup=Constructors.NewSoup();
							NewSoup.SetNamedTag("sv_n^0",signal_init.s_list[signal_init.i].GetName());
							NewSoup.SetNamedTag("sv^0",signal_name);
							NewSoup.SetNamedTag("sv_type^0",sign_type);

							StationProperties.SetNamedSoup(station_name+".svetof_soup",NewSoup);
					

							signal_init.p++;

							}
						}
					}
					signal_init.old_i = signal_init.i;
					signal_init.i++;
				}
			SortAllStations();


			signal_init.i = 0;
			signal_init.stage = 1;
			signal_init.L=StationProperties.GetNamedTagAsInt("st_Number",0);

			PostMessage(me, "SelfTimedMessage", "ProcessInitSignals", 0.0);

			break;


		case 1:
		default:

			while(signal_init.i<signal_init.L)
				{
				SortAllSignasAtStation(signal_init.i);

				signal_init.old_i = signal_init.i;
				signal_init.i++;

				PostMessage(me, "SelfTimedMessage", "ProcessInitSignals", 0.0);

				return;
				}

			IsInited2=true;
			Calculated2=ST1.GetString("alrady_finished");
	
			Sign_init = false;

			PostMessage(me,"Refresh","now",0.0);

			if(sub_browser and !been_refreshing)
				PropertyBrowserRefresh(sub_browser);

			signal_init.is_initing = false;

			break;
		}
	}




void InitSignals_All()
	{

	if(signal_init.is_initing and (signal_init.i != signal_init.old_i))
		{
		signal_init.old_i = signal_init.i;
		return;
		}

	signal_init.is_initing = true;



	Sign_init = true;



	int j;
	signal_init.s_list= World.GetSignalList();



	if(IsInited2)
		{
		int i;
		int L=StationProperties.GetNamedTagAsInt("st_Number",0);

		for(i=0;i<L;i++)
			{

			string ST_name = StationProperties.GetNamedTag("station_name_by_ID"+i);
			Soup sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
			int svetof_numb=StationProperties.GetNamedTagAsInt(ST_name+".svetof_number",0);


			for(j=0;j<svetof_numb;j++)
				{
				int SizeOfPaths=sv_sp.GetNamedTagAsInt("sv_paths_number^"+j,-1);
				int q;
				for(q=0;q<SizeOfPaths;q++) 
					{
					sv_sp.GetNamedSoup("sv_^"+j+"^"+q).Clear();
					}
				}
			sv_sp.Clear();
			
			}

		StationProperties.Clear();

		StationProperties = null;
		}


	
	StationProperties=Constructors.NewSoup();

	signal_init.p=0;
	signal_init.q=100;


	signal_init.i=0;

	signal_init.stage = 0;


	PostMessage(me, "SelfTimedMessage", "ProcessInitSignals", 0.0);

	}




void Log_Signals()
	{
	int i,j,num;

	string Sname,a;

	Soup S_element;

	int station_number=StationProperties.GetNamedTagAsInt("st_Number",0);


	for(i=0;i<station_number;i++)
		{
		Sname=StationProperties.GetNamedTag("station_name_by_ID"+i);
		
		num=StationProperties.GetNamedTagAsInt(Sname+".svetof_number",0);
		S_element=StationProperties.GetNamedSoup(Sname+".svetof_soup");

		a="name "+Sname+" number of signals "+num;

		Interface.Log(a);


		for(j=0;j<num;j++)
			{
			a="svetofor "+j+" is "+S_element.GetNamedTag("sv^"+j) +" numb_of_paths "+S_element.GetNamedTag("sv_n^"+j) ;
			Interface.Log(a);
			}
		}
	}






bool Comp_str_FL2(string a,string b)
	{
	int i=0;

	while(i<=a.size())
		{
		if(i>=a.size())
			return true;
		if(i>=b.size())
			return false;

		if(a[i]>b[i])
			return false;
		if(a[i]<b[i])
			return true;
		++i;
		}


	return false;
	}



void SortAllStations()
	{
	int i, j,q;
	int L=StationProperties.GetNamedTagAsInt("st_Number",0)-1;

	string st_name1;
	string st_name2;
 
	for( i=0; i < L; i++) 
		{

		for( j = 0; j < L-i; j++ ) 
			{
     			q=j+1;


			st_name1=StationProperties.GetNamedTag("station_name_by_ID"+q);
			st_name2=StationProperties.GetNamedTag("station_name_by_ID"+j);


			if( Comp_str_FL2(st_name1 , st_name2))
				{
				StationProperties.SetNamedTag("station_name_by_ID"+j,  st_name1);
				StationProperties.SetNamedTag("station_name_by_ID"+q,  st_name2);

				StationProperties.SetNamedTag(st_name1,j);
				StationProperties.SetNamedTag(st_name2,q);

    				}
  			}
		}
	}




bool Comp_str_FL3(string a,string b)
	{
	if(a==b)
		return false;

	int i=0;
	while(i<=a.size())
		{
		if(i>=a.size())
			return true;
		if(i>=b.size())
			return false;

		if(a[i]>b[i])
			return false;
		if(a[i]<b[i])
			return true;
		++i;
		}

	return false;
	}




void QuickSortSignals(Soup NewSoup, int first, int last)
	{
	if(first >= last)
		return;

	int left = first;
	int right = last;
	int middle_pos = (left + right) / 2;

	string middle_val = NewSoup.GetNamedTag("sv^"+middle_pos);
	
	while (left <= right)
		{
            	while(Comp_str_FL3(NewSoup.GetNamedTag("sv^"+left), middle_val))
			left++;
            	while(Comp_str_FL3(middle_val, NewSoup.GetNamedTag("sv^"+right)))
			right--;

           	if (left <= right)
            		{
			string Svetofor_MAPname=NewSoup.GetNamedTag("sv_n^"+left);
			string Svetofor_name=NewSoup.GetNamedTag("sv^"+left);
			string Svetofor_Type=NewSoup.GetNamedTag("sv_type^"+left);

			// число маршрутов в любом случае на этапе сортировки 0 у всех светофоров

			//NewSoup.SetNamedTag("sv_paths_number^"+left,0);
			//NewSoup.SetNamedTag("sv_paths_number^"+right,0);

			NewSoup.SetNamedTag("sv_n^"+left,NewSoup.GetNamedTag("sv_n^"+right));
			NewSoup.SetNamedTag("sv^"+left,NewSoup.GetNamedTag("sv^"+right));
			NewSoup.SetNamedTag("sv_type^"+left,NewSoup.GetNamedTag("sv_type^"+right));
	
			NewSoup.SetNamedTag("sv_n^"+right,Svetofor_MAPname);
			NewSoup.SetNamedTag("sv^"+right,Svetofor_name);
			NewSoup.SetNamedTag("sv_type^"+right,Svetofor_Type);

                	left++;
                	right--;
            		}
		}

	QuickSortSignals(NewSoup, first, right);
	QuickSortSignals(NewSoup, left, last);

	}



void SortAllSignasAtStation(int Station_id)
	{

	string ST_name = StationProperties.GetNamedTag("station_name_by_ID"+Station_id);
	Soup St_prop = StationProperties.GetNamedSoup(ST_name+".svetof_soup");
	int svetof_numb=StationProperties.GetNamedTagAsInt(ST_name+".svetof_number",0);


	Soup NewSoup=Constructors.NewSoup();
	NewSoup.Copy(St_prop);
	

	QuickSortSignals(NewSoup, 0, svetof_numb-1);

	StationProperties.SetNamedSoup(ST_name+".svetof_soup",NewSoup);

	}


void Log_Junctions();




JunctionInitingObj junct_initing = new JunctionInitingObj();



void ProcessJunctionIniting()
	{
	if(!junct_initing.in_check)
		{

		while(junct_initing.i < junct_initing.j_list.size())
			{


			junct_initing.q++;
			if(junct_initing.q>5)
				{
				junct_initing.qq++;

				if(junct_initing.qq>3)
					{

					Calculated=ST1.GetString("now")+(string)(junct_initing.i*50/junct_initing.j_list.size())+"%";


					PostMessage(me,"Refresh","now",0);
					if(sub_browser and !been_refreshing)
						PropertyBrowserRefresh(sub_browser);

					junct_initing.qq = 0;

					PostMessage(me, "SelfTimedMessage", "ProcessJunctionIniting", 0.0);
					return;
					}

				junct_initing.q=0;


				PostMessage(me, "SelfTimedMessage", "ProcessJunctionIniting", 0.0);
				return;
				}



			bool add_element = false;

			int JunctionID1=FindJunctionPropertiesId(junct_initing.j_list[junct_initing.i]);

			JuctionWithProperties J_element;

			if(JunctionID1 >= 0)
				{
				J_element = (cast<JuctionWithProperties>(BSJunctionLib.DBSE[JunctionID1].Object));
				}
			else
				{

		 		J_element = new JuctionWithProperties();
				add_element = true;
				}


			bool broken1 = false;
		
			junct_initing.OldDir=junct_initing.j_list[junct_initing.i].GetDirection();

			J_element.OldDirection=junct_initing.OldDir;

			junct_initing.j_list[junct_initing.i].SetDirection(Junction.DIRECTION_LEFT);

			junct_initing.GSTS_Initing=junct_initing.j_list[junct_initing.i].BeginTrackSearch(true);

			junct_initing.MO_arr[0]=junct_initing.GSTS_Initing.SearchNext();
			while(junct_initing.MO_arr[0] and (junct_initing.MO_arr[0].GetName()=="" or junct_initing.MO_arr[0].isclass(Vehicle) or !junct_initing.MO_arr[0].isclass(Trackside)))
 				junct_initing.MO_arr[0]=junct_initing.GSTS_Initing.SearchNext();

			if(junct_initing.MO_arr[0])
				junct_initing.Obj_direction[0]=  junct_initing.GSTS_Initing.GetFacingRelativeToSearchDirection();
			else
				broken1 = true;

	
			junct_initing.GSTS_Initing=junct_initing.j_list[junct_initing.i].BeginTrackSearch(false);

			junct_initing.MO_arr[1]=junct_initing.GSTS_Initing.SearchNext();
			while(junct_initing.MO_arr[1] and (junct_initing.MO_arr[1].GetName()=="" or junct_initing.MO_arr[1].isclass(Vehicle) or !junct_initing.MO_arr[1].isclass(Trackside)))
				junct_initing.MO_arr[1]=junct_initing.GSTS_Initing.SearchNext();
 
			if(junct_initing.MO_arr[1])
				junct_initing.Obj_direction[1]=  junct_initing.GSTS_Initing.GetFacingRelativeToSearchDirection();
			else
				broken1 = true;


			junct_initing.j_list[junct_initing.i].SetDirection(Junction.DIRECTION_RIGHT);

			junct_initing.GSTS_Initing=junct_initing.j_list[junct_initing.i].BeginTrackSearch(true);

			junct_initing.MO_arr[2]=junct_initing.GSTS_Initing.SearchNext(); 
			while(junct_initing.MO_arr[2] and (junct_initing.MO_arr[2].GetName()=="" or junct_initing.MO_arr[2].isclass(Vehicle) or !junct_initing.MO_arr[2].isclass(Trackside)))
				junct_initing.MO_arr[2]=junct_initing.GSTS_Initing.SearchNext();

			if(junct_initing.MO_arr[2])
				junct_initing.Obj_direction[2]=  junct_initing.GSTS_Initing.GetFacingRelativeToSearchDirection();
			else
				broken1 = true;

		
			junct_initing.GSTS_Initing=junct_initing.j_list[junct_initing.i].BeginTrackSearch(false);

			junct_initing.MO_arr[3]=junct_initing.GSTS_Initing.SearchNext(); 
			while(junct_initing.MO_arr[3] and (junct_initing.MO_arr[3].GetName()=="" or junct_initing.MO_arr[3].isclass(Vehicle) or !junct_initing.MO_arr[3].isclass(Trackside)))
				junct_initing.MO_arr[3]=junct_initing.GSTS_Initing.SearchNext();

			if(junct_initing.MO_arr[3])
				junct_initing.Obj_direction[3]=  junct_initing.GSTS_Initing.GetFacingRelativeToSearchDirection();
			else
				broken1 = true;

			junct_initing.j_list[junct_initing.i].SetDirection(junct_initing.OldDir);

			if(!junct_initing.MO_arr[0] and junct_initing.MO_arr[1] and junct_initing.MO_arr[2] and junct_initing.MO_arr[3])
				{
				junct_err_string=junct_err_string+ ST1.GetString("err_info_1")+"1"+ST1.GetString("err_info_2")+ junct_initing.j_list[junct_initing.i].GetName()+ ST1.GetString("err_info_3") +junct_initing.MO_arr[1].GetName() +"', '"+ junct_initing.MO_arr[2].GetName() +"', '"+ junct_initing.MO_arr[3].GetName()+"<br>";
				junct_initing.err_numb++;
				}
			else if(junct_initing.MO_arr[0] and !junct_initing.MO_arr[1] and junct_initing.MO_arr[2] and junct_initing.MO_arr[3])
				{
				junct_err_string=junct_err_string+ ST1.GetString("err_info_1")+"1"+ST1.GetString("err_info_2")+ junct_initing.j_list[junct_initing.i].GetName()+ ST1.GetString("err_info_3")+junct_initing.MO_arr[0].GetName() +"', '"+ junct_initing.MO_arr[2].GetName() +"', '"+ junct_initing.MO_arr[3].GetName()+"'<br>";
				junct_initing.err_numb++;
				}
			else if(junct_initing.MO_arr[0] and junct_initing.MO_arr[1] and !junct_initing.MO_arr[2] and junct_initing.MO_arr[3])
				{
				junct_err_string=junct_err_string+ST1.GetString("err_info_1")+"1"+ST1.GetString("err_info_2")+ junct_initing.j_list[junct_initing.i].GetName()+ ST1.GetString("err_info_3")+junct_initing.MO_arr[0].GetName() +"', '"+ junct_initing.MO_arr[1].GetName() +"', '"+ junct_initing.MO_arr[3].GetName()+"'<br>";
				junct_initing.err_numb++;
				}
			else if(junct_initing.MO_arr[0] and junct_initing.MO_arr[1] and junct_initing.MO_arr[2] and !junct_initing.MO_arr[3])
				{
				junct_err_string=junct_err_string+ ST1.GetString("err_info_1")+"1"+ST1.GetString("err_info_2")+ junct_initing.j_list[junct_initing.i].GetName()+ ST1.GetString("err_info_3")+junct_initing.MO_arr[0].GetName() +"', '"+ junct_initing.MO_arr[1].GetName() +"', '"+ junct_initing.MO_arr[2].GetName()+"'<br>";
				junct_initing.err_numb++;
				}
			else if(!broken1)
				{
				if(junct_initing.MO_arr[0] == junct_initing.MO_arr[1] and junct_initing.MO_arr[2] == junct_initing.MO_arr[3])
					{
					junct_err_string=junct_err_string+ ST1.GetString("err_info_1")+"3"+ST1.GetString("err_info_2")+ junct_initing.j_list[junct_initing.i].GetName()+ ST1.GetString("err_info_3")+junct_initing.MO_arr[0].GetName() +"', '"+ junct_initing.MO_arr[2].GetName()+"'<br>";
					junct_initing.err_numb++;
					}
				else if(junct_initing.MO_arr[0] == junct_initing.MO_arr[2] and junct_initing.MO_arr[1] == junct_initing.MO_arr[3])
					{
					junct_err_string=junct_err_string+ ST1.GetString("err_info_1")+"3"+ST1.GetString("err_info_2")+ junct_initing.j_list[junct_initing.i].GetName()+ ST1.GetString("err_info_3")+junct_initing.MO_arr[0].GetName() +"', '"+ junct_initing.MO_arr[1].GetName()+"'<br>";
					junct_initing.err_numb++;
					}
				else if(junct_initing.MO_arr[0] == junct_initing.MO_arr[3] and junct_initing.MO_arr[1] == junct_initing.MO_arr[2])
					{
					junct_err_string=junct_err_string+ ST1.GetString("err_info_1")+"3"+ST1.GetString("err_info_2")+ junct_initing.j_list[junct_initing.i].GetName()+ ST1.GetString("err_info_3")+junct_initing.MO_arr[0].GetName() +"', '"+ junct_initing.MO_arr[1].GetName()+"'<br>";
					junct_initing.err_numb++;
					}

				}
			else
				{
				junct_err_string=junct_err_string+ ST1.GetString("err_info_1")+"2"+ST1.GetString("err_info_2")+junct_initing.j_list[junct_initing.i].GetName() + ST1.GetString("err_info_3");

				bool any_junction = false;

				if(junct_initing.MO_arr[0])
					{
					any_junction = true;
					junct_err_string=junct_err_string+junct_initing.MO_arr[0].GetName();
					}


				if(junct_initing.MO_arr[1])
					{
					if(any_junction)
						junct_err_string=junct_err_string+"', '";
					any_junction = true;
					junct_err_string=junct_err_string+junct_initing.MO_arr[1].GetName();
					}


				if(junct_initing.MO_arr[2])
					{
					if(any_junction)
						junct_err_string=junct_err_string+"', '";
					any_junction = true;
					junct_err_string=junct_err_string+junct_initing.MO_arr[2].GetName();
					}


				if(junct_initing.MO_arr[3])
					{
					if(any_junction)
						junct_err_string=junct_err_string+"', '";
					any_junction = true;
					junct_err_string=junct_err_string+junct_initing.MO_arr[3].GetName();
					}


				junct_err_string=junct_err_string+"'<br>";

				junct_initing.err_numb++;
				}


			if(junct_initing.MO_arr[1] and junct_initing.MO_arr[1]==junct_initing.MO_arr[3])
				{
				if(junct_initing.MO_arr[1].isclass(Junction))
					J_element.back_dir=-1;
				else
					{
					if(junct_initing.Obj_direction[1])
						J_element.back_dir=1;
					else
						J_element.back_dir=0;
					}
				J_element.back=junct_initing.MO_arr[1];

				if(junct_initing.MO_arr[0])
					{
					if(junct_initing.MO_arr[0].isclass(Junction))
						J_element.frontLeft_dir=-1;
					else
						{
						if(junct_initing.Obj_direction[0])
							J_element.frontLeft_dir=1;
						else
							J_element.frontLeft_dir=0;
						}

					J_element.frontLeft=junct_initing.MO_arr[0];
					}
				else
					{
					J_element.frontLeft_dir=1;
					J_element.frontLeft=null;
					}

				if(junct_initing.MO_arr[2])
					{
					if(junct_initing.MO_arr[2].isclass(Junction))
						J_element.frontRight_dir=-1;
					else
						{
						if(junct_initing.Obj_direction[2])
							J_element.frontRight_dir=1;
						else
							J_element.frontRight_dir=0;
						}

					J_element.frontRight=junct_initing.MO_arr[2];
					}
				else
					{
					J_element.frontRight=null;
					J_element.frontRight_dir=1;
					}


				}



			if(junct_initing.MO_arr[0] and junct_initing.MO_arr[0]==junct_initing.MO_arr[2])
				{
				if(junct_initing.MO_arr[0].isclass(Junction))
					J_element.back_dir=-1;
				else
					{
					if(junct_initing.Obj_direction[0])
						J_element.back_dir=1;
					else
						J_element.back_dir=0;
					}
				J_element.back=junct_initing.MO_arr[0];


				if(junct_initing.MO_arr[1])
					{
					if(junct_initing.MO_arr[1].isclass(Junction))
						J_element.frontLeft_dir=-1;
					else
						{
						if(junct_initing.Obj_direction[1])
							J_element.frontLeft_dir=1;
						else
							J_element.frontLeft_dir=0;
						}

					J_element.frontLeft=junct_initing.MO_arr[1];
					}
				else
					{
					J_element.frontLeft_dir=1;
					J_element.frontLeft=null;
					}

			
				if(junct_initing.MO_arr[3])
					{
					if(junct_initing.MO_arr[3].isclass(Junction))
						J_element.frontRight_dir=-1;
					else
						{
						if(junct_initing.Obj_direction[3])
							J_element.frontRight_dir=1;
						else
							J_element.frontRight_dir=0;
						}
					J_element.frontRight=junct_initing.MO_arr[3];
					}
				else
					{
					J_element.frontRight=null;
					J_element.frontRight_dir=1;
					}

				}


			J_element.Permit_done=0;
			J_element.Poshorstnost=false;
			J_element.JunctPos=1;


			junct_initing.GSTS_Initing=junct_initing.j_list[junct_initing.i].BeginTrackSearch(true);
			junct_initing.MO_arr[0]=junct_initing.GSTS_Initing.SearchNext();

			junct_initing.p=0;
			while(junct_initing.MO_arr[0] and junct_initing.MO_arr[0].isclass(Trackside) and junct_initing.p<3)
				{
				junct_initing.MO_arr[0]=junct_initing.GSTS_Initing.SearchNext();
				junct_initing.p++;
				}
			if(junct_initing.MO_arr[0] and !junct_initing.MO_arr[0].isclass(Trackside))
				{
				string J_obj_name = junct_initing.MO_arr[0].GetAsset().GetConfigSoup().GetNamedTag("username");
				Str.ToUpper(J_obj_name);
				if(J_obj_name[J_obj_name.size()-2,]=="_L" or J_obj_name[J_obj_name.size()-2,]==" L" or J_obj_name[J_obj_name.size()-3,J_obj_name.size()-1]=="_L")
					J_element.directionF=0;
				else
					J_element.directionF=2;
				}
			else
				J_element.directionF=2;



			if(add_element)
				{
				string j_name = junct_initing.j_list[junct_initing.i].GetName();
				BSJunctionLib.AddElement(j_name,(cast<GSObject>(J_element)));


				if(J_element.back)
					{
					J_element.back_name = (J_element.back).GetName();
					cache2.SetNamedTag(j_name+".back",J_element.back_name);
					cache2.SetNamedTag(j_name+".back_dir",J_element.back_dir);
					}

				if(J_element.frontLeft)
					{
					J_element.frontLeft_name = (J_element.frontLeft).GetName();
					cache2.SetNamedTag(j_name+".frontLeft",J_element.frontLeft_name);
					cache2.SetNamedTag(j_name+".frontLeft_dir",J_element.frontLeft_dir);
					}

				if(J_element.frontRight)
					{
					J_element.frontRight_name = (J_element.frontRight).GetName();
					cache2.SetNamedTag(j_name+".frontRight",J_element.frontRight_name);
					cache2.SetNamedTag(j_name+".frontRight_dir",J_element.frontRight_dir);
					}

				cache2.SetNamedTag(j_name+".OldDirection",J_element.OldDirection);
				cache2.SetNamedTag(j_name+".directionF",J_element.directionF);

				cache2.SetNamedTag(j_name+".Permit_done",J_element.Permit_done);
				cache2.SetNamedTag(j_name+".Poshorstnost",J_element.Poshorstnost);
				cache2.SetNamedTag(j_name+".JunctPos",J_element.JunctPos);
				cache2.SetNamedTag(j_name+".PrevJunction",J_element.PrevJunction);
				cache2.SetNamedTag(j_name+".LastTrainVelDir",J_element.LastTrainVelDir);


				//cache2.SetNamedTag("soup_name_"+i,j_name);		// номера в базе ещё не актуальные

				}

			junct_initing.old_i = junct_initing.i;
			junct_initing.i++;
			}

		IsInited=true;


		int i;
		for(i=0;i<BSJunctionLib.N;i++)
			cache2.SetNamedTag("soup_name_"+i, BSJunctionLib.DBSE[i].a);	// актуализация номеров


		cache2.SetNamedTag("my_volume1",(int)(BSJunctionLib.N));

		junct_initing.MO_arr[0,4] = null;



		junct_initing.in_check = true;


		junct_initing.i = 0;
		junct_initing.old_i = junct_initing.i;


		PostMessage(me, "SelfTimedMessage", "ProcessJunctionIniting", 0.0);

		}
	else
		{

		while(junct_initing.i < BSJunctionLib.N)
			{


			junct_initing.q++;
			if(junct_initing.q>5)
				{
				junct_initing.qq++;

				if(junct_initing.qq>3)
					{

					Calculated=ST1.GetString("now")+(string)(50+junct_initing.i*50/BSJunctionLib.N)+"%";


					PostMessage(me,"Refresh","now",0);
					if(sub_browser and !been_refreshing)
						PropertyBrowserRefresh(sub_browser);

					junct_initing.qq = 0;

					PostMessage(me, "SelfTimedMessage", "ProcessJunctionIniting", 0.0);
					return;
					}

				junct_initing.q=0;


				PostMessage(me, "SelfTimedMessage", "ProcessJunctionIniting", 0.0);
				return;
				}






			JuctionWithProperties J_element_i = (cast<JuctionWithProperties>(BSJunctionLib.DBSE[junct_initing.i].Object));


			if(J_element_i.back_name != "")
				{

				int named_elem = unique_objBS.Find(J_element_i.back_name,false);
	
				if(named_elem < 0)
					{
					UniqueNamedObjElem new_unique_elem = new UniqueNamedObjElem();
			
					new_unique_elem.obj_itself = J_element_i.back;
					new_unique_elem.JunctionName = BSJunctionLib.DBSE[junct_initing.i].a;

					unique_objBS.AddElement(J_element_i.back_name,(cast<GSObject>(new_unique_elem)));
					}
				else
					{

					if((cast<UniqueNamedObjElem>(unique_objBS.DBSE[named_elem].Object)).obj_itself != J_element_i.back)	// неуникальный объект
						junc_error2 = junc_error2 + J_element_i.back_name + ST1.GetString("err_info_2") + BSJunctionLib.DBSE[junct_initing.i].a +"', '" +(cast<UniqueNamedObjElem>(unique_objBS.DBSE[named_elem].Object)).JunctionName + "'<br>";
					}
				}



			if(J_element_i.frontLeft_name != "")
				{

				int named_elem = unique_objBS.Find(J_element_i.frontLeft_name,false);
	
				if(named_elem < 0)
					{
					UniqueNamedObjElem new_unique_elem = new UniqueNamedObjElem();
			
					new_unique_elem.obj_itself = J_element_i.frontLeft;
					new_unique_elem.JunctionName = BSJunctionLib.DBSE[junct_initing.i].a;

			
					unique_objBS.AddElement(J_element_i.frontLeft_name,(cast<GSObject>(new_unique_elem)));
					}
				else
					{

					if((cast<UniqueNamedObjElem>(unique_objBS.DBSE[named_elem].Object)).obj_itself != J_element_i.frontLeft)	// неуникальный объект
						junc_error2 = junc_error2 + J_element_i.frontLeft_name + ST1.GetString("err_info_2") + BSJunctionLib.DBSE[junct_initing.i].a +"', '" +(cast<UniqueNamedObjElem>(unique_objBS.DBSE[named_elem].Object)).JunctionName + "'<br>";
					}
				}



			if(J_element_i.frontRight_name != "")
				{

				int named_elem = unique_objBS.Find(J_element_i.frontRight_name,false);
	
				if(named_elem < 0)
					{
					UniqueNamedObjElem new_unique_elem = new UniqueNamedObjElem();
			
					new_unique_elem.obj_itself = J_element_i.frontRight;
					new_unique_elem.JunctionName = BSJunctionLib.DBSE[junct_initing.i].a;

			
					unique_objBS.AddElement(J_element_i.frontRight_name,(cast<GSObject>(new_unique_elem)));
					}
				else
					{

					if((cast<UniqueNamedObjElem>(unique_objBS.DBSE[named_elem].Object)).obj_itself != J_element_i.frontRight)	// неуникальный объект
						junc_error2 = junc_error2 + J_element_i.frontRight_name + ST1.GetString("err_info_2") + BSJunctionLib.DBSE[junct_initing.i].a +"', '" +(cast<UniqueNamedObjElem>(unique_objBS.DBSE[named_elem].Object)).JunctionName + "'<br>";
					}
				}

			junct_initing.old_i = junct_initing.i;
			junct_initing.i++;
			}

		int i;
		for(i = 0; i < unique_objBS.N; i++)
			{
			(cast<UniqueNamedObjElem>(unique_objBS.DBSE[i].Object)).obj_itself = null;
			unique_objBS.DBSE[i].Object = null;
			}

		unique_objBS.DBSE[0,] = null;
		unique_objBS.N = 0;



		if(junc_error2 != "")
			junct_err_string = junct_err_string + "<br><br>" + ST1.GetString("junct_err_info_dublic") + junc_error2;




		if(junct_err_string!="")
			{

			junct_err_string = ST1.GetString("junct_err_info")+ ST1.GetString("err_numb") +junct_initing.err_numb+"<br><br>" +junct_err_string;

			Br_mode = true;
			MainShowSignals();
			}


		Calculated=ST1.GetString("alrady_finished");

		Junct_init = false;

		PostMessage(me,"Refresh","now",0);
		if(sub_browser and !been_refreshing)
			PropertyBrowserRefresh(sub_browser);

	//	Log_Junctions();



		junct_initing.is_initing = false;


		}
	}






void InitJunctions_All()
	{
	if(junct_initing.is_initing and (junct_initing.i != junct_initing.old_i))
		{
		junct_initing.old_i = junct_initing.i;
		return;
		}
	junct_initing.is_initing = true;





	Junct_init = true;


	Calculated=ST1.GetString("Is_going");	

	junct_initing.j_list=World.GetJunctionList();

	
	junct_initing.MO_arr=new MapObject[4];

	junct_initing.Obj_direction= new bool[4];

	junct_initing.q=0;

	junct_err_string="";
	junc_error2="";




	for(junct_initing.i=0;junct_initing.i<BSJunctionLib.DBSE.size();junct_initing.i++)
		{
		if(BSJunctionLib.DBSE[junct_initing.i])
			{
			if(BSJunctionLib.DBSE[junct_initing.i].Object and BSJunctionLib.DBSE[junct_initing.i].Object.isclass(JuctionWithProperties))
				{
				(cast<JuctionWithProperties>(BSJunctionLib.DBSE[junct_initing.i].Object)).back = null;
	
				(cast<JuctionWithProperties>(BSJunctionLib.DBSE[junct_initing.i].Object)).frontLeft = null;
	
				(cast<JuctionWithProperties>(BSJunctionLib.DBSE[junct_initing.i].Object)).frontRight = null;
				}
			BSJunctionLib.DBSE[junct_initing.i].Object = null;
			}
		}


	BSJunctionLib.DBSE[0,] = null;

	BSJunctionLib.N = 0;
	

	junct_initing.qq =5;

	junct_initing.err_numb = 0;


	junct_initing.i = 0;

	junct_initing.in_check = false;


	cache2.Clear();
	

	PostMessage(me, "SelfTimedMessage", "ProcessJunctionIniting", 0.0);	


	}




Soup ToSoupJL()
	{
	int i;
	Soup sp3=Constructors.NewSoup();
	sp3.Copy(cache2);


	JuctionWithProperties J_element;

	for(i=0;i<BSJunctionLib.N;i++)
		{

		J_element=cast<JuctionWithProperties>(BSJunctionLib.DBSE[i].Object);
		string j_name = BSJunctionLib.DBSE[i].a;


		sp3.SetNamedTag(j_name+".Permit_done",J_element.Permit_done);
		sp3.SetNamedTag(j_name+".Poshorstnost",J_element.Poshorstnost);
		sp3.SetNamedTag(j_name+".JunctPos",J_element.JunctPos);
		sp3.SetNamedTag(j_name+".PrevJunction",J_element.PrevJunction);
		sp3.SetNamedTag(j_name+".LastTrainVelDir",J_element.LastTrainVelDir);
			
		}

	return sp3;
	}




void FromSoupJL(Soup sp7)
	{
	int i;

	int size11=sp7.GetNamedTagAsInt("my_volume1",-1);

//string sq="i tterdsdsd____"+size11+"_____________";
//Interface.Log(sq);
			

	if(size11<=0)
		return;




	BSJunctionLib.DBSE[0,] = null;
	BSJunctionLib.N = 0;

	
	string J_name;



	JuctionWithProperties[] J_elements=new JuctionWithProperties[size11];

	BSJunctionLib.N=size11;
	BSJunctionLib.DBSE=new BinarySortedElementS[size11];

	for(i=0;i<size11;i++)
		{
		J_elements[i] = new JuctionWithProperties();

		JuctionWithProperties J_element=J_elements[i];
		
		J_name=sp7.GetNamedTag((string)("soup_name_"+i));

		
		
		J_element.back_name=sp7.GetNamedTag(J_name+".back");
		if(J_element.back_name!="")
			J_element.back = cast<MapObject>Router.GetGameObject(J_element.back_name);
		else
			J_element.back = null;
		J_element.back_dir =(int) sp7.GetNamedTagAsInt(J_name+".back_dir",1);


		J_element.frontLeft_name=sp7.GetNamedTag(J_name+".frontLeft");
		if(J_element.frontLeft_name!="")
			J_element.frontLeft = cast<MapObject>Router.GetGameObject(J_element.frontLeft_name);
		else
			J_element.frontLeft = null;
		J_element.frontLeft_dir =  sp7.GetNamedTagAsInt(J_name+".frontLeft_dir",1);


		J_element.frontRight_name=sp7.GetNamedTag(J_name+".frontRight");
		if(J_element.frontRight_name!="")
			J_element.frontRight = cast<MapObject>Router.GetGameObject(J_element.frontRight_name);
		else
			J_element.frontRight = null;
		J_element.frontRight_dir = sp7.GetNamedTagAsInt(J_name+".frontRight_dir",1);

		
		J_element.OldDirection = sp7.GetNamedTagAsInt(J_name+".OldDirection",0);
		J_element.directionF = sp7.GetNamedTagAsInt(J_name+".directionF",0);
		J_element.Permit_done = sp7.GetNamedTagAsInt(J_name+".Permit_done",0); 
		J_element.Message_perm = 0;
		J_element.Poshorstnost = sp7.GetNamedTagAsBool(J_name+".Poshorstnost",false);
		J_element.JunctPos = sp7.GetNamedTagAsInt(J_name+".JunctPos",1); 			
		J_element.PrevJunction = sp7.GetNamedTagAsInt(J_name+".PrevJunction",-1);
		J_element.LastTrainVelDir = sp7.GetNamedTagAsBool(J_name+".LastTrainVelDir", true);



		if(PathLib.Find(J_element.Permit_done,false)<0)
			J_element.Permit_done = 0;
		
		BSJunctionLib.DBSE[i] = new BinarySortedElementS();
		BSJunctionLib.DBSE[i].a =J_name;
		BSJunctionLib.DBSE[i].Object=cast<GSObject>J_element;
		
		}

	IsInited=true;
	Calculated=ST1.GetString("alrady_finished");


	}


void Log_Junctions()
	{
	int i;

	string a;
	string b;
	string c;

	JuctionWithProperties J_element;

	for(i=0;i<BSJunctionLib.N;i++)
		{
		a="";
		b="";
		c="";

		J_element=cast<JuctionWithProperties>(BSJunctionLib.DBSE[i].Object);

		if(J_element.frontLeft)
			a=(J_element.frontLeft).GetName();
		if(J_element.frontRight)
			b=(J_element.frontRight).GetName();
		if(J_element.back)
			c=(J_element.back).GetName();
		
		a=BSJunctionLib.DBSE[i].a+": back "+c+" "+J_element.back_dir+" left "+a+" "+J_element.frontLeft_dir+" right "+b+" "+J_element.frontRight_dir+" otklonenie = "+J_element.directionF;

		Interface.Log(a);
		
		}
	} 





public string GetDescriptionHTML(void)
        {
        string s = inherited();
	string StationsListStr="";


	StationsListStr=MakeStationList();

        
	s=s+HTMLWindow.MakeTable
		(

		HTMLWindow.MakeRow
			(
			HTMLWindow.MakeCell
				(
				HTMLWindow.MakeLink("live://property/seachforjunctions",ST1.GetString("Initalljunctions")+Calculated+" ")
				)+
			HTMLWindow.MakeCell
				(
				HTMLWindow.MakeLink("live://property/err_junctions",ST1.GetString("err_junctions"))
				)
			)+
		HTMLWindow.MakeRow
			(
			HTMLWindow.MakeCell
				(
				HTMLWindow.MakeLink("live://property/initsignas",ST1.GetString("Init_all_signals")+Calculated2+" ")
				)+
			HTMLWindow.MakeCell
				(
				HTMLWindow.MakeLink("live://property/station_browser",ST1.GetString("output_signals"))
				)
			)+





		HTMLWindow.MakeRow
			(
			HTMLWindow.MakeCell
				(
				HTMLWindow.MakeLink("live://property/initallpaths",ST1.GetString("init_all_paths"))
				)+
			HTMLWindow.MakeCell
				(
				HTMLWindow.CheckBox("live://property/usd_route",is_uzd_route)+HTMLWindow.MakeLink("live://property/usd_route",ST1.GetString("usd_route"))
				)
			)+




		HTMLWindow.MakeRow
			(
			HTMLWindow.MakeCell
				(
				HTMLWindow.MakeLink("live://property/deletelongpaths",ST1.GetString("delete_long_paths"))
				)+
			HTMLWindow.MakeCell
				(
				" "
				)
			)+





		HTMLWindow.MakeRow
			(
			HTMLWindow.MakeCell
				(
				" ."
				)+
			HTMLWindow.MakeCell
				(
				" "
				)
			)+

		StationsListStr
		);


    	return s;
        }



void AnsweringHander(Message msg)
	{
	if(msg.minor=="Find_Junction_Path_base")
		PostMessage(msg.src,"TJunction_Path_sourceA",me.GetId(),0);



	}


public string GetPropertyType2(string propertyID)
        {
	if(propertyID[0,10]=="svetofor_m")
		return "int,-1,100,1";
        return "link";
        }

string GetPropertyType(string propertyID)
        {
	return GetPropertyType2(propertyID);
        }



string MakeStationList()
	{
	string output="";

	string other="";


	int i,j,k;

	int L=StationProperties.GetNamedTagAsInt("st_Number",0);

	for(i=0;i<L;i++)
		{
		if(i==currentStation)
			other=part_of_st;
		else
			other="";

		output=output+	HTMLWindow.MakeRow
			(
			HTMLWindow.MakeCell
				(
				HTMLWindow.MakeLink("live://property/station_p^"+i, StationProperties.GetNamedTag("station_name_by_ID"+i))+" . "+HTMLWindow.MakeLink("live://property/station_init^"+i, ST1.GetString("initiate"))+" . "+ HTMLWindow.MakeLink("live://property/station_d^"+i, ST1.GetString("deldubl"))+other,
				"colspan=2"
				)
			);
		if(i==currentStation)
			{
			string ST_name = StationProperties.GetNamedTag("station_name_by_ID"+i);
			Soup St_prop = StationProperties.GetNamedSoup(ST_name+".svetof_soup");
			int svetofnumber1=StationProperties.GetNamedTagAsInt(ST_name+".svetof_number",0);

			for(j=0;j<svetofnumber1;j++)
				{

				if( St_prop.GetNamedTagAsInt("sv_type^"+j,0)&(2+4+8) )
					{
					output=output+


					HTMLWindow.MakeRow
					(
					HTMLWindow.MakeCell
						(

					HTMLWindow.MakeTable	(

					HTMLWindow.MakeRow
					(
					HTMLWindow.MakeCell
						(
						" "
						)+
					HTMLWindow.MakeCell
						(
						HTMLWindow.MakeLink("live://property/svetofor_p^"+j, St_prop.GetNamedTag((string)("sv^"+j)))
						)+
					HTMLWindow.MakeCell
						(
						" . "+HTMLWindow.MakeLink("live://property/svetofor+p^"+j, ST1.GetString("initiate2"))+" . "+ HTMLWindow.MakeLink("live://property/svetofor_d^"+j, ST1.GetString("deldubl2"))
						)
					))));


					if(j==currentSignalId)
						{
						int SizeOfPaths=St_prop.GetNamedTagAsInt("sv_paths_number^"+j,-1);
							
						output=output+HTMLWindow.MakeRow
						(
						HTMLWindow.MakeCell
							(
							" "
							)+
						HTMLWindow.MakeCell
							(
							ST1.GetString("help")
							)
						);


						if(SizeOfPaths>0)
							{

							for(k=0;k<SizeOfPaths;k++)
								{
								Soup Old_sp=St_prop.GetNamedSoup("sv_^"+currentSignalId+"^"+k);
								int dd=Old_sp.GetNamedTagAsInt("NumberOfObjects");
								string objects9="";
								int qq;
								for(qq=0;qq<dd;qq++)
									objects9=objects9+" "+Old_sp.GetNamedTag("object_"+qq);

								float len=Old_sp.GetNamedTagAsFloat("object_length",-1);

								if(len>0)
									objects9=objects9+" "+(int)len+ST1.GetString("meter");

								objects9=objects9+"<br>"+Old_sp.GetNamedTag("object_ending");

								int priority1=Old_sp.GetNamedTagAsInt("object_priority",0);


								output=output+	HTMLWindow.MakeRow
								(
								HTMLWindow.MakeCell
									(
									" "+k+") "+
									HTMLWindow.MakeLink("live://property/svetofor_m^"+j+"^"+k, ST1.GetString("priority"))+": "+
									HTMLWindow.MakeLink("live://property/svetofor_m^"+j+"^"+k, priority1)+". "+
									HTMLWindow.MakeLink("live://property/svetofor_x^"+j+"^"+k, "X")
									)+
								HTMLWindow.MakeCell
									(
									objects9
									)
								);



								}

							}


						}
					}



				}
			}

		}
	return output;


	}



StationPathInitingObj station_init = new StationPathInitingObj();


void StationPathIniting()
	{


	if(path_initing.Path_init)
		{
		PostMessage(me, "SelfTimedMessage", "StationPathIniting", 0.0);
		return;
		}
	else if(station_init.qq>2)
		{
		station_init.qq = 0;
		part_of_st=" "+(string)(station_init.i*100/station_init.N)+"%";
		PostMessage(me,"Refresh","now",0.0);
		if(sub_browser and !been_refreshing)
			PropertyBrowserRefresh(sub_browser);

		PostMessage(me, "SelfTimedMessage", "StationPathIniting", 0.0);
		return;
		}




	while(station_init.i<station_init.N)
		{
		
		if(station_init.St_prop.GetNamedTagAsInt("sv_type^"+station_init.i,0)&(2+4+8))
			{
			MakeAllPathsFromSignal(currentStation,station_init.i);
			

			station_init.qq++;

			station_init.old_i = station_init.i;
			station_init.i++;

			if(path_initing.Path_init)
				{
				PostMessage(me, "SelfTimedMessage", "StationPathIniting", 0.0);
				return;
				}
			}
		else
			{
			station_init.old_i = station_init.i;
			station_init.i++;
			}

		}

	part_of_st="";



	if(station_init.stop)
		{
		PostMessage(me,"Refresh","now",0.0);

		if(sub_browser and !been_refreshing)
			PropertyBrowserRefresh(sub_browser);
		}

	station_init.Path_init = false;


	}





void InitStation(int currentStation, bool stop)
	{

	if(station_init.Path_init)
		{
		if(station_init.i != station_init.old_i)
			{
			station_init.old_i = station_init.i;
			return;
			}
		else
			{
			path_initing.Path_init = false;
			}
		}



	station_init.stop = stop;

	station_init.Path_init = true;


	station_init.i = 0;
	station_init.N=StationProperties.GetNamedTagAsInt(StationProperties.GetNamedTag("station_name_by_ID"+ currentStation)+".svetof_number",0);
	station_init.St_prop = StationProperties.GetNamedSoup(StationProperties.GetNamedTag("station_name_by_ID"+ currentStation)+".svetof_soup");


	station_init.qq = 2;


	PostMessage(me, "SelfTimedMessage", "StationPathIniting", 0.0);
	}



AllPathInitingObj all_path = new AllPathInitingObj();


void AllPathIniting()
	{

	if(station_init.Path_init)
		{
		PostMessage(me, "SelfTimedMessage", "AllPathIniting", 0.0);
		return;
		}


	while(all_path.i<all_path.L)
		{
		currentStation = all_path.i;

		InitStation(currentStation, false);
		all_path.old_i = all_path.i;
		all_path.i++;

		if(station_init.Path_init)
			{
			PostMessage(me, "SelfTimedMessage", "AllPathIniting", 0.0);
			return;
			}

		}
	PostMessage(me,"Refresh","now",0.0);

	if(sub_browser and !been_refreshing)
		PropertyBrowserRefresh(sub_browser);


	all_path.is_initing = false;
	}




void InitPath_All()
	{
	if(all_path.is_initing)
		{
		if(all_path.i != all_path.old_i)
			{
			all_path.old_i = all_path.i;
			return;
			}
		else
			{
			station_init.Path_init = false;
			path_initing.Path_init = false;
			}
		}

	all_path.is_initing = true;


	all_path.i = 0;
	all_path.L=StationProperties.GetNamedTagAsInt("st_Number",0);


	PostMessage(me, "SelfTimedMessage", "AllPathIniting", 0.0);
	}







DeleteLongPathObj delete_long = new DeleteLongPathObj();



void DeleteLongAltPaths(string ST_name, int SignalId_next, int pathN)
	{

	if(delete_long.DeletingLong)
		{
		if(delete_long.k != delete_long.old_k)
			{
			delete_long.old_k = delete_long.k;
			return;
			}

		}


	delete_long.DeletingLong = true;



	delete_long.sv_sp= StationProperties.GetNamedSoup(ST_name +".svetof_soup");
	delete_long.SignalId = SignalId_next;


	Soup sp1=delete_long.sv_sp.GetNamedSoup("sv_^"+delete_long.SignalId+"^"+pathN);
	delete_long.curr_dst=sp1.GetNamedTag("object_ending");

	delete_long.span_path = (Str.Find(delete_long.curr_dst, "@", 0) >= 0);
	delete_long.sign1 = cast<zxSignal>(Router.GetGameObject(   delete_long.sv_sp.GetNamedTag("sv_n^"+delete_long.SignalId)   ) );

	delete_long.SizeOfPaths = delete_long.sv_sp.GetNamedTagAsInt("sv_paths_number^"+delete_long.SignalId,-1);

	delete_long.lengthA=new float[delete_long.SizeOfPaths];
	delete_long.Id_A=new int[delete_long.SizeOfPaths];

	delete_long.lenA_num = 0;


	delete_long.sleep_cnt = 0;

	
	delete_long.k = 0;


	PostMessage(me, "SelfTimedMessage", "DeletingLongAltPaths", 0.0);

	}


void DeletingLongAltPaths()
	{

	while(delete_long.k < delete_long.SizeOfPaths) 
		{
		Soup Old_sp=delete_long.sv_sp.GetNamedSoup("sv_^"+delete_long.SignalId+"^"+delete_long.k);
		

		if(Old_sp.GetNamedTag("object_ending") == delete_long.curr_dst)
			{
			
			int JunctionsNumber2 = Old_sp.GetNamedTagAsInt("NumberOfObjects",0);
			int i=0;
			Junction Jn1;
			while(i<JunctionsNumber2)
				{
				string[] tmpstr2=Str.Tokens(Old_sp.GetNamedTag("object_"+i),",");
				int temp_id=BSJunctionLib.Find(tmpstr2[0],false);
							
				Jn1 = cast<Junction>Router.GetGameObject(  BSJunctionLib.DBSE[temp_id].a);

				Jn1.SetDirection(Str.ToInt(tmpstr2[1]));
				i++;	
				}

				
			GSTrackSearch GSTS1=(cast<Trackside>delete_long.sign1).BeginTrackSearch(true);

			MapObject MO=delete_long.sign1;

			bool w_end = false;
			
			while(MO and !w_end )
				{
				MO=GSTS1.SearchNext();
				if(MO and MO.isclass(zxSignal) )
					{
					zxSignal temp1 = cast<zxSignal>MO;

					if(delete_long.span_path and (delete_long.curr_dst == (temp1.privateName+"@"+temp1.stationName)))
						w_end=true;

					if(!delete_long.span_path and (delete_long.curr_dst == temp1.privateName))
						w_end=true;						
					}
				}
				
			delete_long.lengthA[delete_long.lenA_num] = GSTS1.GetDistance();
			delete_long.Id_A[delete_long.lenA_num] = delete_long.k;
			delete_long.lenA_num++;


			delete_long.old_k = delete_long.k;
			delete_long.k++;


			delete_long.sleep_cnt++;
			if(delete_long.sleep_cnt > 1)
				{
				delete_long.sleep_cnt = 0;
				PostMessage(me, "SelfTimedMessage", "DeletingLongAltPaths", 0.0);
				return;
				}

			}
		else
			{
			delete_long.old_k = delete_long.k;
			delete_long.k++;
			}
		
			
		}

	if(delete_long.lenA_num <= 1)
		{
		delete_long.result = false;
		delete_long.DeletingLong = false;
		return;
		}
		

	float best_d=delete_long.lengthA[0]+2;
	int best_id=0;
	
	int k;
	
	for(k=0;k<delete_long.lenA_num;k++)
		{
		if(delete_long.lengthA[k]<best_d)
			{
			best_d=delete_long.lengthA[k];
			best_id=delete_long.Id_A[k];
			}
		}			

	int q = 0;

	
	for(k=0;k<delete_long.lenA_num;k++)
		{
		string sv_1name="sv_^"+delete_long.SignalId+"^"+delete_long.Id_A[k];



		if(delete_long.Id_A[k] == best_id)
			{

	
			}
		else
			{
			(delete_long.sv_sp.GetNamedSoup(sv_1name)).Clear();

			delete_long.sv_sp.RemoveNamedTag(sv_1name);


			int i;
			for(i=delete_long.Id_A[k]+1;i<delete_long.SizeOfPaths;i++)
				{
				Soup temp_soup1 = delete_long.sv_sp.GetNamedSoup("sv_^"+delete_long.SignalId+"^"+i);
				delete_long.sv_sp.SetNamedSoup( "sv_^"+delete_long.SignalId+"^"+(i-1) , temp_soup1);
				}

			delete_long.sv_sp.RemoveNamedTag( "sv_^"+delete_long.SignalId+"^"+(delete_long.SizeOfPaths-1) );


			if( delete_long.Id_A[k] < best_id )
				best_id--;

			int j;
			for(j=k;j<delete_long.lenA_num;j++)
				{
				if( delete_long.Id_A[j] > delete_long.Id_A[k] )
					delete_long.Id_A[j]--;
				}


			delete_long.SizeOfPaths--;

			}	

		sv_1name=null;
		}			


	delete_long.sv_sp.SetNamedTag("sv_paths_number^"+delete_long.SignalId, delete_long.SizeOfPaths);

	delete_long.result = true;

	delete_long.DeletingLong = false;
	}





DeletePathSignalObj delete_path_signal = new DeletePathSignalObj();



void DeletePathSignal(int station, int sign_id_next)
	{
	if(delete_path_signal.is_deleting)
		{
		if(delete_path_signal.i != delete_path_signal.old_i)
			{
			delete_path_signal.old_i = delete_path_signal.i;
			return;
			}
		else
			delete_long.DeletingLong = false;
		}


	delete_path_signal.is_deleting = true;




	delete_path_signal.ST_name = StationProperties.GetNamedTag("station_name_by_ID"+currentStation);
	delete_path_signal.sign_id = sign_id_next;
	delete_path_signal.i = 0;
	
	Soup sv_sp = StationProperties.GetNamedSoup(delete_path_signal.ST_name +".svetof_soup");
	delete_path_signal.SizeOfPaths=sv_sp.GetNamedTagAsInt("sv_paths_number^"+delete_path_signal.sign_id,-1);

	delete_long.result = true;

	PostMessage(me, "SelfTimedMessage", "DeletingPathSignal", 0.0);
	}


void DeletingPathSignal()
	{
	if(delete_long.DeletingLong)
		{
		PostMessage(me, "SelfTimedMessage", "DeletingPathSignal", 0.0);
		return;
		}
	else if(!delete_long.result)
		{
		delete_path_signal.old_i = delete_path_signal.i;
		delete_path_signal.i++;
		}

	if(delete_path_signal.i<delete_path_signal.SizeOfPaths)
		{
		DeleteLongAltPaths(delete_path_signal.ST_name, delete_path_signal.sign_id, delete_path_signal.i);

		PostMessage(me, "SelfTimedMessage", "DeletingPathSignal", 0.0);
		return;
		}

	ResetJunctions();

	if(sub_browser and !been_refreshing)
		PropertyBrowserRefresh(sub_browser);

	delete_path_signal.is_deleting = false;
	}



DeletePathStationObj delete_path_station = new DeletePathStationObj();



void DeletePathCurrStation(bool stop_next, bool reset_next)
	{

	if(delete_path_station.is_deleting)
		{
		
		if(delete_path_station.j != delete_path_station.old_j or delete_path_station.i != delete_path_station.old_i)
			{
			delete_path_station.old_j = delete_path_station.j;
			delete_path_station.old_i = delete_path_station.i;
			return;
			}
		else
			delete_long.DeletingLong = false;

		}


	delete_path_station.is_deleting = true;


	delete_path_station.reset = reset_next;
	delete_path_station.stop = stop_next;



	delete_path_station.ST_name = StationProperties.GetNamedTag("station_name_by_ID"+currentStation);
	delete_path_station.svetof_numb=StationProperties.GetNamedTagAsInt(delete_path_station.ST_name+".svetof_number",0);
	delete_path_station.sv_sp = StationProperties.GetNamedSoup(delete_path_station.ST_name +".svetof_soup");

	delete_path_station.j = 0;
	delete_path_station.i = 0;
	delete_path_station.SizeOfPaths = delete_path_station.sv_sp.GetNamedTagAsInt("sv_paths_number^"+delete_path_station.j,-1);
	delete_long.result = true;


	PostMessage(me, "SelfTimedMessage", "DeletingPathCurrStation", 0.0);
	}



void DeletingPathCurrStation()
	{

	if(delete_long.DeletingLong)
		{
		PostMessage(me, "SelfTimedMessage", "DeletingPathCurrStation", 0.0);
		return;
		}


	if(!delete_long.result)
		{
		delete_path_station.old_i = delete_path_station.i;
		delete_path_station.i++;
		}


	if(delete_path_station.i<delete_path_station.SizeOfPaths)
		{
		DeleteLongAltPaths(delete_path_station.ST_name, delete_path_station.j, delete_path_station.i);
		PostMessage(me, "SelfTimedMessage", "DeletingPathCurrStation", 0.0);
		return;
		}
	else
		{
		if((delete_path_station.j + 1) < delete_path_station.svetof_numb)
			{
			delete_path_station.old_j = delete_path_station.j;
			delete_path_station.j++;

			part_of_st=" "+(string)(delete_path_station.j*100/delete_path_station.svetof_numb)+"%";
			PostMessage(me,"Refresh","now",0);
			if(sub_browser and !been_refreshing)
				PropertyBrowserRefresh(sub_browser);


			delete_path_station.i = 0;
			delete_path_station.SizeOfPaths = delete_path_station.sv_sp.GetNamedTagAsInt("sv_paths_number^"+delete_path_station.j,-1);
			delete_long.result = true;


			PostMessage(me, "SelfTimedMessage", "DeletingPathCurrStation", 0.0);
			return;
			}
		}

	part_of_st= "";


	if(delete_path_station.reset)
		ResetJunctions();

	if(delete_path_station.stop)
		{
		PostMessage(me,"Refresh","now",0.0);
		if(sub_browser and !been_refreshing)
			PropertyBrowserRefresh(sub_browser);
		}


	delete_path_station.is_deleting = false;


	}





DeleteLongPathAllObj delete_path_all = new DeleteLongPathAllObj();



void DeleteLongPathsAll()
	{
	if(delete_path_all.is_deleting)
		{
		if(delete_path_all.i != delete_path_all.old_i)
			{
			delete_path_all.old_i = delete_path_all.i;
			return;
			}
		else
			{
			delete_long.DeletingLong = false;
			delete_path_station.is_deleting = false;
			}
		}

	delete_path_all.is_deleting = true;
	delete_path_all.i = 0;
	delete_path_all.L=StationProperties.GetNamedTagAsInt("st_Number",0);


	PostMessage(me, "SelfTimedMessage", "DeletingLongPathsAll", 0.0);
	}



void DeletingLongPathsAll()
	{

	if(delete_path_station.is_deleting)
		{
		PostMessage(me, "SelfTimedMessage", "DeletingLongPathsAll", 0.0);
		return;
		}


	if(delete_path_all.i < delete_path_all.L)
		{
		currentStation = delete_path_all.i;
		DeletePathCurrStation(false,false);

		delete_path_all.old_i = delete_path_all.i;
		delete_path_all.i++;

		PostMessage(me, "SelfTimedMessage", "DeletingLongPathsAll", 0.0);
		return;
		}

	ResetJunctions();
	PostMessage(me,"Refresh","now",0.0);
	if(sub_browser and !been_refreshing)
		PropertyBrowserRefresh(sub_browser);

	delete_path_all.is_deleting = false;
	}







public void  SetPropertyValue2 (string propertyID, int value) 
{
string[] tookens=Str.Tokens(propertyID,"^");
if(tookens[0]=="svetofor_m")
	{
	int i=currentSignalId;
	int i2=Str.ToInt(tookens[2]);


	Soup sp1=Constructors.NewSoup();
	Soup sp2=Constructors.NewSoup();

	string sp_name=StationProperties.GetNamedTag("station_name_by_ID"+currentStation)+".svetof_soup";

	
	sp1.Copy(StationProperties.GetNamedSoup(sp_name));

	string sv_1name="sv_^"+i+"^"+i2;

	sp2.Copy(sp1.GetNamedSoup(sv_1name));
	sp2.SetNamedTag("object_priority",value);

	sp1.SetNamedSoup(sv_1name,sp2);

	StationProperties.SetNamedSoup(sp_name,sp1);
	}
}



void  SetPropertyValue (string propertyID, int value) 
{
	SetPropertyValue2 (propertyID,value);
}






public string   GetPropertyValue  ( string propertyID) 
{
	
string[] tookens=Str.Tokens(propertyID,"^");
if(tookens[0]=="svetofor_m")
	{
	int i=currentSignalId;
	int i2=Str.ToInt(tookens[2]);

	string sp_name=StationProperties.GetNamedTag("station_name_by_ID"+currentStation)+".svetof_soup";

	return StationProperties.GetNamedSoup(sp_name).GetNamedSoup("sv_^"+i+"^"+i2).GetNamedTag("object_priority");

	}
return "";
}




public string GetContentViewDetails(void)
{
 	string s="";
 	HTMLWindow hw=HTMLWindow;


	if(!Br_mode)
		{

		if(currentStation<0 or !StationProperties)
			return s;


	
		string Sname=StationProperties.GetNamedTag("station_name_by_ID"+currentStation);
		
		int i, num=StationProperties.GetNamedTagAsInt(Sname+".svetof_number",0);
		Soup S_element=StationProperties.GetNamedSoup(Sname+".svetof_soup");


		if(!S_element)
			return s;


		s=s+ST1.GetString("station") +Sname +"<br><br> ";

		for(i=0;i<num;i++)
			{
			s=s+ S_element.GetNamedTag("sv^"+i)+" '"+ S_element.GetNamedTag("sv_n^"+i) +"'<br>";
			}
		}
	else
		{
		s = junct_err_string;
		
		}


	s = "<html><body>"+s+"</body></html>";

	return s;


}


thread void ShowBrowser(void)
{
	Message msg;
 	while (mn)
        	{
        	wait()
			{
			on "Browser-URL","",msg: 
				{
			        continue;
                        	}
                	on "Browser-Closed","",msg: 
				if(msg.src==mn)
					mn=null;
                	}
        	}
        mn=null;
}

void MainShowSignals()
{
	if(!mn)
		{
		mn=Constructors.NewBrowser();
		ShowBrowser();
		}

        
        mn.LoadHTMLString(GetAsset(),GetContentViewDetails());
        int x=Math.Rand(0,20);
        int y=Math.Rand(0,20);


	
	if(!Br_mode)
	        mn.SetWindowRect(100+x,100+y,500+x,250+y);
	else
	        mn.SetWindowRect(100+x,100+y,700+x,250+y);

	mn.SetWindowGrow(1, 1, 3000, 3000);
        
 }


void RefreshBrowser()
{
 	if(mn)
		mn.LoadHTMLString(GetAsset(),GetContentViewDetails());
}



public void LinkPropertyValue2(string propertyID)
        {
        if(propertyID == "seachforjunctions")
        	{
		InitJunctions_All();
           	}
	else if(propertyID == "err_junctions")
		{
		Br_mode = true;
		MainShowSignals();
		}
	else if(propertyID == "station_browser")
		{
		Br_mode = false;
		MainShowSignals();
		}
        else if(propertyID == "initsignas")
        	{
		InitSignals_All();
		}
	else if(propertyID == "initallpaths")
        	{
		InitPath_All();
		}
	else if(propertyID == "deletelongpaths")
        	{
		DeleteLongPathsAll();
		}
	else if(propertyID == "usd_route")
		{
		is_uzd_route = !is_uzd_route;
		}
	else
		{
		string[] tookens=Str.Tokens(propertyID,"^");
		if(tookens[0]=="station_p")
			{
			currentStation=Str.ToInt(tookens[1]);
			RefreshBrowser();
			}
		if(tookens[0]=="station_init")
			{
			currentStation=Str.ToInt(tookens[1]);
			InitStation(currentStation, true);
			}

		if(tookens[0]=="station_d")
			{
			currentStation=Str.ToInt(tookens[1]);
			DeletePathCurrStation(true,true);
			}
		if(tookens[0]=="svetofor+p")	
			{
			currentSignalId=Str.ToInt(tookens[1]);
			MakeAllPathsFromSignal(currentStation,currentSignalId);
			}
		if(tookens[0]=="svetofor_p")	
			{
			currentSignalId=Str.ToInt(tookens[1]);
			}
		if(tookens[0]=="svetofor_d")
			{
			currentSignalId=Str.ToInt(tookens[1]);
			DeletePathSignal(currentStation,currentSignalId);
			}
		if(tookens[0]=="svetofor_x")
			{
			int i=currentSignalId;
			int i2=Str.ToInt(tookens[2]);


			Soup sp1=Constructors.NewSoup();
			Soup sp2=Constructors.NewSoup();

			string sp_name=StationProperties.GetNamedTag("station_name_by_ID"+currentStation)+".svetof_soup";

			sp1.Copy(StationProperties.GetNamedSoup(sp_name));

			int j;
			string sv_1name;
			int path_number=sp1.GetNamedTagAsInt("sv_paths_number^"+i);

			sp1.SetNamedTag("sv_paths_number^"+i,path_number-1);

			for(j=i2;j<path_number-1;j++)
				{
				sp2.Clear();
				sv_1name="sv_^"+i+"^"+(j+1);
				sp2.Copy(sp1.GetNamedSoup(sv_1name));
				
				sv_1name="sv_^"+i+"^"+j;

				sp1.SetNamedSoup(sv_1name,sp2);
				}
			sp1.RemoveNamedTag("sv_^"+i+"^"+(path_number-1));			

			StationProperties.SetNamedSoup(sp_name,sp1);
			}
		}



	
        }

void LinkPropertyValue(string propertyID)
	{

	LinkPropertyValue2(propertyID);
	inherited(propertyID);
	}

public Soup GetProperties(void)
	{
	Soup retSoup = inherited();

	if(IsInited and !cache2.IsLocked())
		{
		retSoup.SetNamedSoup("my_soup1",ToSoupJL());
		}

	if(IsInited2 and !StationProperties.IsLocked())
		retSoup.SetNamedSoup("my_Signals1",StationProperties);

	retSoup.SetNamedSoup("my_Paths1",ToSoupPaths());


	retSoup.SetNamedTag("my_CurrentPath",CurrentPath);

	retSoup.SetNamedTag("reset_jun",reset_jun);


	retSoup.SetNamedTag("is_uzd_route", is_uzd_route);

	retSoup.SetNamedSoup("processing_junctions",processing_junctions);

     
	return retSoup;
	}






JunctionLoadingObj jun_load = new JunctionLoadingObj();


void Initing1(Soup soup)
	{
	if(jun_load.IsIniting1_msg)
		return;


	if(!IsInited)
		{
		cache2.Clear();
		cache2.Copy(soup.GetNamedSoup("my_soup1"));	

		jun_load.IsIniting1_msg = true;



		jun_load.i = 0;
		jun_load.size11 = cache2.GetNamedTagAsInt("my_volume1",-1);

//string sq="size 11 ____"+jun_load.size11+"_____________";
//Interface.Log(sq);
			

		if(jun_load.size11<=0)
			return;


		BSJunctionLib.DBSE[0,] = null;
		BSJunctionLib.N = 0;


		jun_load.J_elements = new JuctionWithProperties[jun_load.size11];
		BSJunctionLib.DBSE = new BinarySortedElementS[jun_load.size11];

		PostMessage(me, "SelfTimedMessage", "ProcessIniting1", 0.0);
		}
	}


void ProcessIniting1()
	{
	string J_name;
	string temp_string1;


	while(jun_load.i<jun_load.size11)
		{
		jun_load.J_elements[jun_load.i] = new JuctionWithProperties();

		JuctionWithProperties J_element=jun_load.J_elements[jun_load.i];
		

		J_name=cache2.GetNamedTag((string)("soup_name_"+jun_load.i));
		temp_string1=cache2.GetNamedTag(J_name+".back");


		if(temp_string1!="")
			J_element.back = cast<MapObject>Router.GetGameObject(temp_string1);
		else
			J_element.back = null;
		J_element.back_dir =(int) cache2.GetNamedTagAsInt(J_name+".back_dir",1);


		temp_string1=cache2.GetNamedTag(J_name+".frontLeft");
		if(temp_string1!="")
			J_element.frontLeft = cast<MapObject>Router.GetGameObject(temp_string1);
		else
			J_element.frontLeft = null;
		J_element.frontLeft_dir =  cache2.GetNamedTagAsInt(J_name+".frontLeft_dir",1);


		temp_string1=cache2.GetNamedTag(J_name+".frontRight");
		if(temp_string1!="")
			J_element.frontRight = cast<MapObject>Router.GetGameObject(temp_string1);
		else
			J_element.frontRight = null;
		J_element.frontRight_dir = cache2.GetNamedTagAsInt(J_name+".frontRight_dir",1);

		
		J_element.OldDirection = cache2.GetNamedTagAsInt(J_name+".OldDirection",0);
		J_element.directionF = cache2.GetNamedTagAsInt(J_name+".directionF",0);
		J_element.Permit_done = cache2.GetNamedTagAsInt(J_name+".Permit_done",0); 
		J_element.Message_perm = 0;
		J_element.Poshorstnost = cache2.GetNamedTagAsBool(J_name+".Poshorstnost",false);
		J_element.JunctPos = cache2.GetNamedTagAsInt(J_name+".JunctPos",1); 			
		J_element.PrevJunction = cache2.GetNamedTagAsInt(J_name+".PrevJunction",-1);
		J_element.LastTrainVelDir = cache2.GetNamedTagAsBool(J_name+".LastTrainVelDir", true);



		if(PathLib.Find(J_element.Permit_done,false)<0)
			J_element.Permit_done = 0;
		
		BSJunctionLib.DBSE[jun_load.i] = new BinarySortedElementS();
		BSJunctionLib.DBSE[jun_load.i].a = J_name;
		BSJunctionLib.DBSE[jun_load.i].Object = cast<GSObject>J_element;
		

		jun_load.i++;

		if((jun_load.i % 300) == 0)
			{
			PostMessage(me, "SelfTimedMessage", "ProcessIniting1", 0.0);
			return;
			}
		}

	BSJunctionLib.N = jun_load.size11;


	IsInited=true;
	Calculated=ST1.GetString("alrady_finished");


	jun_load.IsIniting1_msg = false;
	}



public void SetProperties(Soup soup)
	{
	inherited(soup);

	Initing1(soup);

	if(!IsInited2)
		{
		StationProperties.Copy(soup.GetNamedSoup("my_Signals1"));
		if(StationProperties.GetNamedTagAsInt("st_Number",-1)>=0)
			{
			Calculated2=ST1.GetString("alrady_finished");
			IsInited2=true;


			currentStation=0;
			currentSignalId=0;
			}
		}
	FromSoupPaths(soup.GetNamedSoup("my_Paths1"));
	CurrentPath=soup.GetNamedTagAsInt("my_CurrentPath",2);

	reset_jun = soup.GetNamedTagAsBool("reset_jun",false);

	
	is_uzd_route = soup.GetNamedTagAsBool("is_uzd_route", false);

	processing_junctions.Clear();
	processing_junctions.Copy(soup.GetNamedSoup("processing_junctions"));
	}





public bool SelfTimedHandler(Message msg)
	{
	if(inherited(msg))
		return true;

	if(msg.minor == "ProcessIniting1")
		{
		ProcessIniting1();
		return true;
		}
	if(msg.minor == "ProcessJunctionIniting")
		{
		ProcessJunctionIniting();
		return true;
		}
	if(msg.minor == "ProcessInitSignals")
		{
		ProcessInitSignals();
		return true;
		}
	if(msg.minor == "StationPathIniting")
		{
		StationPathIniting();
		return true;
		}
	if(msg.minor == "AllPathIniting")
		{
		AllPathIniting();
		return true;
		}
	if(msg.minor == "DeletingLongAltPaths")
		{
		DeletingLongAltPaths();
		return true;
		}
	if(msg.minor == "DeletingPathSignal")
		{
		DeletingPathSignal();
		return true;
		}
	if(msg.minor == "DeletingPathCurrStation")
		{
		DeletingPathCurrStation();
		return true;
		}
	if(msg.minor == "DeletingLongPathsAll")
		{
		DeletingLongPathsAll();
		return true;
		}
	

	return false;
	}




public void  Init (Asset asset)
	{
	inherited(asset);

	BSJunctionLib= new BinarySortedArrayS();
	StationProperties= Constructors.NewSoup();
	PathLib= new BinarySortedArrayS2();
	cache2=Constructors.NewSoup();
	processing_junctions = Constructors.NewSoup();
	unique_objBS = new BinarySortedArrayS();

			
	AddHandler(me,"TJunction_Path_source","Find_Junction_Path_base","AnsweringHander");
	AddHandler(me,"SelfTimedMessage","","SelfTimedHandler");


	InitPathCleaner();
	

	ST1= GetAsset().GetStringTable();
	Calculated=ST1.GetString("not_yet");
	Calculated2=ST1.GetString("not_yet");
  	}


};